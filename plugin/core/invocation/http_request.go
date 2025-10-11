package invocation

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/tool_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/http_requests"
)

type RequestBackwardsInvocation struct {
	ApiKey       string
	ApiBaseUrl   *url.URL
	client       *http.Client
	writeTimeout int64
	readTimeout  int64
}

type BackwardsInvocationResponse[T any] struct {
	Data  *T     `json:"data,omitempty"`
	Error string `json:"error"`
}

func (r *RequestBackwardsInvocation) FetchApp(payload *FetchAppRequest) (map[string]any, error) {
	type resp struct {
		Data map[string]any `json:"data,omitempty"`
	}

	data, err := Request[resp](r, "POST", "fetch/app/info", http_requests.HttpPayloadJson(payload))
	if err != nil {
		return nil, err
	}
	if data.Data == nil {
		return nil, fmt.Errorf("data is nil")
	}

	return data.Data, nil
}

func (r *RequestBackwardsInvocation) InvokeApp(payload *InvokeAppRequest) (*utils.Stream[map[string]any], error) {
	return StreamResponse[map[string]any](r, "POST", "invoke/app", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeEncrypt(payload *InvokeEncryptRequest) (map[string]any, error) {
	if !payload.EncryptRequired() {
		return payload.Data, nil
	}

	type resp struct {
		Data map[string]any `json:"data,omitempty"`
	}

	data, err := Request[resp](r, "POST", "invoke/encrypt", http_requests.HttpPayloadJson(payload))
	if err != nil {
		return nil, err
	}

	return data.Data, nil
}

func (r *RequestBackwardsInvocation) InvokeLLM(payload *InvokeLLMRequest) (*utils.Stream[model_entities.LLMResultChunk], error) {
	return StreamResponse[model_entities.LLMResultChunk](r, "POST", "invoke/llm", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeLLMWithStructuredOutput(payload *InvokeLLMWithStructuredOutputRequest) (*utils.Stream[model_entities.LLMResultChunkWithStructuredOutput], error) {
	return StreamResponse[model_entities.LLMResultChunkWithStructuredOutput](r, "POST", "/invoke/llm/structured-output", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeModeration(payload *InvokeModerationRequest) (*model_entities.ModerationResult, error) {
	return Request[model_entities.ModerationResult](r, "POST", "/invoke/moderation", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeParameterExtractor(payload *InvokeParameterExtractorRequest) (*InvokeNodeResponse, error) {
	return Request[InvokeNodeResponse](r, "POST", "invoke/parameter-extractor", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeQuestionClassifier(payload *InvokeQuestionClassifierRequest) (*InvokeNodeResponse, error) {
	return Request[InvokeNodeResponse](r, "POST", "invoke/question-classifier", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeRerank(payload *InvokeRerankRequest) (*model_entities.RerankResult, error) {
	return Request[model_entities.RerankResult](r, "POST", "invoke/rerank", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeSpeech2Text(payload *InvokeSpeech2TextRequest) (*model_entities.Speech2TextResult, error) {
	return Request[model_entities.Speech2TextResult](r, "POST", "invoke/speech2text", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeSummary(payload *InvokeSummaryRequest) (*InvokeSummaryResponse, error) {
	return Request[InvokeSummaryResponse](r, "POST", "invoke/summary", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeTTS(payload *InvokeTTSRequest) (*utils.Stream[model_entities.TTSResult], error) {
	return StreamResponse[model_entities.TTSResult](r, "POST", "invoke/speech2text", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeTextEmbedding(payload *InvokeTextEmbeddingRequest) (*model_entities.TextEmbeddingResult, error) {
	return Request[model_entities.TextEmbeddingResult](r, "POST", "invoke/text-embedding", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) InvokeTool(payload *InvokeToolRequest) (*utils.Stream[tool_entities.ToolResponseChunk], error) {
	return StreamResponse[tool_entities.ToolResponseChunk](r, "POST", "invoke/tool", http_requests.HttpPayloadJson(payload))
}

func (r *RequestBackwardsInvocation) UploadFile(payload *UploadFileRequest) (*UploadFileResponse, error) {
	return Request[UploadFileResponse](r, "POST", "upload/file/request", http_requests.HttpPayloadJson(payload))
}
