package service

import (
	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/dynamic_select_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/oauth_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeLLM(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeLLM],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.LLMResultChunk], error) {
			return plugin_daemon.InvokeLLM(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_LLM,
		req,
		ctx,
		maxTimeout,
	)
}

func GetLLMNumTokens(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetLLMNumTokens],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.LLMNumTokensResponse], error) {
			return plugin_daemon.GetLLMNumTokens(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_GET_LLM_NUM_TOKENS,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeTextEmbedding(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeTextEmbedding],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.TextEmbeddingResult], error) {
			return plugin_daemon.InvokeTextEmbedding(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_TEXT_EMBEDDING,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeGetTextEmbeddingNumTokens(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetTextEmbeddingNumTokens],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.GetTextEmbeddingNumTokensResponse], error) {
			return plugin_daemon.GetTextEmbeddingNumTokens(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_GET_TEXT_EMBEDDING_NUM_TOKENS,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeRerank(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeRerank],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.RerankResult], error) {
			return plugin_daemon.InvokeRerank(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_RERANK,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeTTS(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeTTS],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.TTSResult], error) {
			return plugin_daemon.InvokeTTS(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_TTS,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeGetTTSModelVoices(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetTTSModelVoices],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.GetTTSVoicesResponse], error) {
			return plugin_daemon.GetTTSModelVoices(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_GET_TTS_MODEL_VOICES,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeSpeech2Text(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeSpeech2Text],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.Speech2TextResult], error) {
			return plugin_daemon.InvokeSpeech2Text(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_SPEECH2TEXT,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeModeration(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestInvokeModeration],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.ModerationResult], error) {
			return plugin_daemon.InvokeModeration(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_MODERATION,
		req,
		ctx,
		maxTimeout,
	)
}

func ValidateProviderCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestValidateProviderCredentials],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.ValidateCredentialResult], error) {
			return plugin_daemon.ValidateProviderCredentials(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_MODERATION,
		req,
		ctx,
		maxTimeout,
	)
}

func ValidateModelCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestValidateModelCredentials],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.ValidateCredentialResult], error) {
			return plugin_daemon.ValidateModelCredentials(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_MODERATION,
		req,
		ctx,
		maxTimeout,
	)
}

func InvokeGetAIModelSchema(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestGetAIModelSchema],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[model_entities.GetModelSchemaResponse], error) {
			return plugin_daemon.GetAIModelSchema(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_INVOKE_MODERATION,
		req,
		ctx,
		maxTimeout,
	)
}

func GetAuthorizationURL(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestOAuthGetAuthorizationURL],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[oauth_entities.OAuthGetAuthorizationURLResult], error) {
			return plugin_daemon.GetAuthorizationURL(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_GET_AUTHORIZATION_URL,
		req,
		ctx,
		maxTimeout,
	)
}

func GetCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestOAuthGetCredentials],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[oauth_entities.OAuthGetCredentialsResult], error) {
			return plugin_daemon.GetCredentials(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_GET_CREDENTIALS,
		req,
		ctx,
		maxTimeout,
	)
}

func RefreshCredentials(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestOauthRefreshCredentials],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[oauth_entities.OAuthRefreshCredentialsResult], error) {
			return plugin_daemon.RefreshCredentials(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_REFRESH_CREDENTIALS,
		req,
		ctx,
		maxTimeout,
	)
}

func DynamicParameterSelect(
	ctx *gin.Context,
	req *plugin_entities.InvokePluginRequest[requests.RequestDynamicParameterSelect],
	maxTimeout int,
) {
	baseSSEWithSession(
		func(session *session_manager.Session) (*utils.Stream[dynamic_select_entities.DynamicSelectResult], error) {
			return plugin_daemon.FetchDynamicParameterOptions(session, &req.Data)
		},
		access_types.PLUGIN_ACCESS_TYPE_MODEL,
		access_types.PLUGIN_ACCESS_ACTION_REFRESH_CREDENTIALS,
		req,
		ctx,
		maxTimeout,
	)
}
