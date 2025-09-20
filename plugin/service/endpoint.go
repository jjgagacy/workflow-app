package service

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/endpoint_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
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

	// fetch plugin

	fmt.Printf("%v %v\n", buffer.String(), identifier)
}
