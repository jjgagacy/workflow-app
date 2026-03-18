package controllers

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/server/server_const"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

func logRequestBody(ctx *gin.Context) {
	bodyBytes, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		fmt.Printf("Error reading body: %v\n", err)
	} else {
		fmt.Printf("Raw Body: %s\n", string(bodyBytes))
	}

	// 重要：重新设置 Body，因为读取后原 Body 会被消耗
	ctx.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	// 打印其他信息
	fmt.Printf("Content-Type: %s\n", ctx.GetHeader("Content-Type"))
	fmt.Printf("Method: %s\n", ctx.Request.Method)
	fmt.Printf("URL: %s\n", ctx.Request.URL.String())
	fmt.Printf("Query: %v\n", ctx.Request.URL.Query())
}

func BindRequest[T any](ctx *gin.Context, success func(T)) {
	var req T

	// 调试：读取并打印 Body 内容
	// logRequestBody(ctx)

	// bind query always
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(400, entities.BadRequestError(err).ToResponse())
		return
	}

	if ctx.Request.Method != http.MethodGet {
		if ctx.Request.Header.Get("Content-Type") == "application/json" {
			if err := ctx.ShouldBindJSON(&req); err != nil {
				ctx.JSON(400, entities.BadRequestError(err).ToResponse())
				return
			}
		} else {
			if err := ctx.ShouldBind(&req); err != nil {
				ctx.JSON(400, entities.BadRequestError(err).ToResponse())
				return
			}
		}
	}

	// bind uri
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(400, entities.BadRequestError(err).ToResponse())
		return
	}

	// validate
	if err := validators.EntitiesValidator.Struct(req); err != nil {
		ctx.JSON(400, entities.BadRequestError(err).ToResponse())
		return
	}

	success(req)
}

func BindPluginDispatchRequest[T any](rtx *gin.Context, success func(plugin_entities.InvokePluginRequest[T])) {
	BindRequest(rtx, func(req plugin_entities.InvokePluginRequest[T]) {
		uniqueIdentifier, exists := rtx.Get(server_const.PLUGIN_UNIQUE_IDENTIFIER)
		if !exists {
			rtx.JSON(400, entities.UniqueIdentifierInvalidError(errors.New("plugin unique identifier invalid")).ToResponse())
			return
		}

		pluginUniqueIdentifier, ok := uniqueIdentifier.(plugin_entities.PluginUniqueIdentifier)
		if !ok {
			rtx.JSON(400, entities.UniqueIdentifierInvalidError(errors.New("plugin unique identifier invalid")).ToResponse())
			return
		}

		req.UniqueIdentifier = pluginUniqueIdentifier

		success(req)
	})
}
