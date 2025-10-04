package service

import (
	"bytes"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/endpoint_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func copyRequest(req *http.Request, hookId string, path string) (*bytes.Buffer, error) {
	clonedReq := req.Clone(req.Context())
	// get query params
	queryParams := req.URL.Query()
	// replace path with endpoint path
	clonedReq.URL.Path = path
	// set query params
	clonedReq.URL.RawQuery = queryParams.Encode()
	// read request body until complete, max 10MB
	body, err := io.ReadAll(io.LimitReader(req.Body, 10*1024*1024))
	if err != nil {
		return nil, err
	}

	// replace with a new reader
	clonedReq.Body = io.NopCloser(bytes.NewReader(body))
	clonedReq.ContentLength = int64(len(body))
	clonedReq.TransferEncoding = nil

	// add hook id to header
	clonedReq.Header.Set("X-Hook-ID", hookId)
	// add original method to header
	clonedReq.Header.Set("X-Original-Method", req.Method)

	// remove ip traces for security reasons
	clonedReq.Header.Del("X-Forwarded-For")
	clonedReq.Header.Del("X-Real-IP")
	clonedReq.Header.Del("X-Forwarded")
	clonedReq.Header.Del("X-Original-Forwarded-For")
	clonedReq.Header.Del("X-Original-Url")
	clonedReq.Header.Del("X-Original-Host")

	// check if X-Original-Host is set
	if originalHost := req.Header.Get(endpoint_entities.HeaderXOriginalHost); originalHost != "" {
		clonedReq.Host = originalHost
		clonedReq.Header.Set("Host", originalHost)
	}

	// check if X-Hook-Url is set
	if url := req.Header.Get("X-Hook-Url"); url != "" {
		clonedReq.Header.Set("X-Hook-Url", fmt.Sprintf("http://%s/endpoint/%s%s", req.Host, hookId, path))
	}

	// create a buffer to hold the request
	var buf bytes.Buffer
	if err := clonedReq.Write(&buf); err != nil {
		return nil, err
	}

	return &buf, nil
}

func EndPoint(ctx *gin.Context, endPoint *model.EndPoint, pluginInstallation *model.PluginInstallation, maxExecutionTime time.Duration, path string) {
	if !endPoint.Enabled {
		ctx.JSON(404, entities.NotFoundError(errors.New("endpoint not found")).ToResponse())
		return
	}

	buffer, err := copyRequest(ctx.Request, endPoint.HookID, path)
	if err != nil {
		ctx.JSON(500, entities.InternalError(err).ToResponse())
		return
	}

	identifier, err := plugin_entities.NewPluginUniqueIdentifier(pluginInstallation.PluginUniqueIdentifier)
	if err != nil {
		ctx.JSON(500, entities.UniqueIdentifierInvalidError(err).ToResponse())
		return
	}

	manager := plugin_manager.Manager()
	runtime, err := manager.Get(identifier)
	if err != nil {
		ctx.JSON(404, entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse)
		return
	}

	// fetch endpoint declaration
	endPointDeclaration := runtime.Configuration().EndPoint
	if endPointDeclaration == nil {
		ctx.JSON(404, entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse)
		return
	}

	// decrypt settings
	decryptSettings, err := manager.BackwardsInvocation().InvokeEncrypt(
		&invocation.InvokeEncryptRequest{
			BaseInvokeRequest: invocation.BaseInvokeRequest{
				TenantID: endPoint.TenantID,
				UserID:   "",
				Type:     invocation.INVOKE_TYPE_ENCRYPT,
			},
			InvokeEncryptSchema: invocation.InvokeEncryptSchema{
				Opt:       invocation.ENCRYPT_OPT_DECRYPT,
				Namespace: invocation.ENCRYPT_NAMESPACE_ENDPOINT,
				Identity:  endPoint.ID,
				Data:      endPoint.Settings,
				Config:    endPointDeclaration.Settings,
			},
		},
	)
	if err != nil {
		ctx.JSON(500, entities.InternalError(err).ToResponse())
		return
	}

	session := session_manager.NewSession(
		session_manager.SessionPayload{
			TenantID:               endPoint.TenantID,
			UserID:                 "",
			PluginUniqueIdentifier: identifier,
			AccessType:             access_types.PLUGIN_ACCESS_TYPE_ENDPOINT,
			AccessAction:           access_types.PLUGIN_ACCESS_ACTION_INVOKE_ENDPOINT,
			Declaration:            runtime.Configuration(),
			BackwardsInvocation:    manager.BackwardsInvocation(),
			IgnoreCache:            true,
			EndPointID:             &endPoint.ID,
		},
	)
	defer session.Close(session_manager.CloseSessionPayload{
		IgnoreCache: true,
	})

	session.BindRuntime(runtime)

	statusCode, headers, response, err := plugin_daemon.InvokeEndPoint(
		session,
		&requests.RequestInvokeEndPoint{
			RawHttpRequest: hex.EncodeToString(buffer.Bytes()),
			Settings:       decryptSettings,
		},
	)
	if err != nil {
		ctx.JSON(500, entities.InternalError(err).ToResponse())
		return
	}
	defer response.Close()

	done := make(chan bool)
	closed := new(int32)

	ctx.Status(statusCode)
	for k, v := range *headers {
		if len(v) > 0 {
			ctx.Writer.Header().Set(k, v[0])
		}
	}

	close := func() {
		if atomic.CompareAndSwapInt32(closed, 0, 1) {
			close(done)
		}
	}
	defer close()

	utils.Submit(map[string]string{
		"module":   "service",
		"function": "Endpoint",
	}, func() {
		defer close()

		for response.Next() {
			chunk, err := response.Read()
			if err != nil {
				ctx.Writer.Write([]byte(err.Error()))
				ctx.Writer.Flush()
				return
			}
			ctx.Writer.Write(chunk)
			ctx.Writer.Flush()
		}
	})

	select {
	case <-ctx.Writer.CloseNotify():
	case <-done:
	case <-time.After(maxExecutionTime):
		ctx.JSON(500, entities.InternalError(errors.New("killed by timeout")).ToResponse())
	}
}
