package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/service"
)

func InvokeLLM(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeLLM]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeLLM(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetLLMNumTokens(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestGetLLMNumTokens]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.GetLLMNumTokens(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func InvokeTextEmbedding(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeTextEmbedding]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeTextEmbedding(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetTextEmbeddingNumTokens(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestGetTextEmbeddingNumTokens]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeGetTextEmbeddingNumTokens(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func InvokeRerank(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeRerank]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeRerank(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func InvokeTTS(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeTTS]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeTTS(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetTTSModelVoices(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestGetTTSModelVoices]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeGetTTSModelVoices(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func InvokeSpeech2Text(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeSpeech2Text]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeSpeech2Text(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func InvokeModeration(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeModeration]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeModeration(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func ValidateProviderCredentials(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestValidateProviderCredentials]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.ValidateProviderCredentials(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func ValidateModelCredentials(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestValidateModelCredentials]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.ValidateModelCredentials(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetAIModelSchema(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestGetAIModelSchema]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeGetAIModelSchema(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func InvokeTool(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestInvokeTool]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeTool(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func ValidateToolCredentials(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestValidateToolCredentials]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.ValidateToolCredentials(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetToolRuntimeParameters(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestGetToolRuntimeParameters]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.InvokeGetToolRuntimeParameters(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetAuthorizationURL(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestOAuthGetAuthorizationURL]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.GetAuthorizationURL(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func GetCredentials(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestOAuthGetCredentials]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.GetCredentials(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func RefreshCredentials(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestOauthRefreshCredentials]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.RefreshCredentials(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}

func FetchDynamicParameterOptions(config *core.Config) gin.HandlerFunc {
	type request = plugin_entities.InvokePluginRequest[requests.RequestDynamicParameterSelect]

	return func(ctx *gin.Context) {
		BindPluginDispatchRequest(
			ctx,
			func(req request) {
				service.DynamicParameterSelect(ctx, &req, config.PluginMaxExecutionTimeout)
			},
		)
	}
}
