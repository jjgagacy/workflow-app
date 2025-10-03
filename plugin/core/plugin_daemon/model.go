package plugin_daemon

import (
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func InvokeLLM(
	session *session_manager.Session,
	req *requests.RequestInvokeLLM,
) (
	*utils.Stream[model_entities.LLMResultChunk], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeLLM, model_entities.LLMResultChunk](
		session,
		req,
		512,
	)
}

func GetLLMNumTokens(
	session *session_manager.Session,
	req *requests.RequestGetLLMNumTokens,
) (
	*utils.Stream[model_entities.LLMNumTokensResponse], error,
) {
	return GenericInvokePlugin[requests.RequestGetLLMNumTokens, model_entities.LLMNumTokensResponse](
		session,
		req,
		1,
	)
}

func InvokeTextEmbedding(
	session *session_manager.Session,
	req *requests.RequestInvokeTextEmbedding,
) (
	*utils.Stream[model_entities.TextEmbeddingResult], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeTextEmbedding, model_entities.TextEmbeddingResult](
		session,
		req,
		1,
	)
}

func GetTextEmbeddingNumTokens(
	session *session_manager.Session,
	req *requests.RequestGetTextEmbeddingNumTokens,
) (
	*utils.Stream[model_entities.GetTextEmbeddingNumTokensResponse], error,
) {
	return GenericInvokePlugin[requests.RequestGetTextEmbeddingNumTokens, model_entities.GetTextEmbeddingNumTokensResponse](
		session,
		req,
		1,
	)
}

func InvokeRerank(
	session *session_manager.Session,
	req *requests.RequestInvokeRerank,
) (
	*utils.Stream[model_entities.RerankResult], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeRerank, model_entities.RerankResult](
		session,
		req,
		1,
	)
}

func InvokeTTS(
	session *session_manager.Session,
	req *requests.RequestInvokeTTS,
) (
	*utils.Stream[model_entities.TTSResult], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeTTS, model_entities.TTSResult](
		session,
		req,
		1,
	)
}

func GetTTSModelVoices(
	session *session_manager.Session,
	req *requests.RequestGetTTSModelVoices,
) (
	*utils.Stream[model_entities.GetTTSVoicesResponse], error,
) {
	return GenericInvokePlugin[requests.RequestGetTTSModelVoices, model_entities.GetTTSVoicesResponse](
		session,
		req,
		1,
	)
}

func InvokeSpeech2Text(
	session *session_manager.Session,
	req *requests.RequestInvokeSpeech2Text,
) (
	*utils.Stream[model_entities.Speech2TextResult], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeSpeech2Text, model_entities.Speech2TextResult](
		session,
		req,
		1,
	)
}

func InvokeModeration(
	session *session_manager.Session,
	req *requests.RequestInvokeModeration,
) (
	*utils.Stream[model_entities.ModerationResult], error,
) {
	return GenericInvokePlugin[requests.RequestInvokeModeration, model_entities.ModerationResult](
		session,
		req,
		1,
	)
}

func ValidateProviderCredentials(
	session *session_manager.Session,
	req *requests.RequestValidateProviderCredentials,
) (
	*utils.Stream[model_entities.ValidateCredentialResult], error,
) {
	return GenericInvokePlugin[requests.RequestValidateProviderCredentials, model_entities.ValidateCredentialResult](
		session,
		req,
		1,
	)
}

func ValidateModelCredentials(
	session *session_manager.Session,
	req *requests.RequestValidateModelCredentials,
) (
	*utils.Stream[model_entities.ValidateCredentialResult], error,
) {
	return GenericInvokePlugin[requests.RequestValidateModelCredentials, model_entities.ValidateCredentialResult](
		session,
		req,
		1,
	)
}

func GetAIModelSchema(
	session *session_manager.Session,
	req *requests.RequestGetAIModelSchema,
) (
	*utils.Stream[model_entities.GetModelSchemaResponse], error,
) {
	return GenericInvokePlugin[requests.RequestGetAIModelSchema, model_entities.GetModelSchemaResponse](
		session,
		req,
		1,
	)
}
