package service

import (
	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
)

func InvokeLLM(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeLLM],
	maxTimeout int,
) {

}

func InvokeLLMNumTokens(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeLLMNumTokens],
	maxTimeout int,
) {

}

func InvokeTextEmbedding(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeTextEmbedding],
	maxTimeout int,
) {

}

func InvokeGetTextEmbeddingNumTokens(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetTextEmbeddingNumTokens],
	maxTimeout int,
) {

}

func InvokeRerank(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeRerank],
	maxTimeout int,
) {

}

func InvokeTTS(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeTTS],
	maxTimeout int,
) {

}
func InvokeGetTTSModelVoices(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetTTSModelVoices],
	maxTimeout int,
) {

}

func InvokeSpeech2Text(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeSpeech2Text],
	maxTimeout int,
) {

}

func InvokeModeration(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeModeration],
	maxTimeout int,
) {

}

func ValidateProviderCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestValidateProviderCredentials],
	maxTimeout int,
) {

}

func ValidateModelCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestValidateModelCredentials],
	maxTimeout int,
) {

}

func InvokeGetAIModelSchema(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetAIModelSchema],
	maxTimeout int,
) {

}

func InvokeTool(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeTool],
	maxTimeout int,
) {

}

func ValidateToolCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestValidateToolCredentials],
	maxTimeout int,
) {

}

func InvokeGetToolRuntimeParameters(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetToolRuntimeParameters],
	maxTimeout int,
) {

}

func GetAuthorizationURL(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestOAuthGetAuthorizationURL],
	maxTimeout int,
) {

}

func GetCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestOAuthGetCredentials],
	maxTimeout int,
) {

}

func RefreshCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestOauthRefreshCredentials],
	maxTimeout int,
) {

}

func DynamicParameterSelect(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestDynamicParameterSelect],
	maxTimeout int,
) {

}
