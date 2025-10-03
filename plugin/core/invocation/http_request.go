package invocation

import (
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

// FetchApp implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) FetchApp(payload *FetchAppRequest) (map[string]any, error) {
	panic("unimplemented")
}

// InvokeApp implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeApp(payload *InvokeAppRequest) (*utils.Stream[map[string]any], error) {
	panic("unimplemented")
}

// InvokeEncrypt implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeEncrypt(payload *InvokeEncryptRequest) (map[string]any, error) {
	panic("unimplemented")
}

func (r *RequestBackwardsInvocation) InvokeLLM(payload *InvokeLLMRequest) (*utils.Stream[model_entities.LLMResultChunk], error) {
	return StreamResponse[model_entities.LLMResultChunk](r, "POST", "invoke/llm", http_requests.HttpPayloadJson(payload))
}

// InvokeLLMWithStructuredOutput implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeLLMWithStructuredOutput(payload *InvokeLLMWithStructuredOutputRequest) (*utils.Stream[model_entities.LLMResultChunkWithStructuredOutput], error) {
	panic("unimplemented")
}

// InvokeModeration implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeModeration(payload *InvokeModerationRequest) (*model_entities.ModerationResult, error) {
	panic("unimplemented")
}

// InvokeParameterExtractor implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeParameterExtractor(payload *InvokeParameterExtractorRequest) (*InvokeNodeResponse, error) {
	panic("unimplemented")
}

// InvokeQuestionClassifier implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeQuestionClassifier(payload *InvokeQuestionClassifierRequest) (*InvokeNodeResponse, error) {
	panic("unimplemented")
}

// InvokeRerank implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeRerank(payload *InvokeRerankRequest) (*model_entities.RerankResult, error) {
	panic("unimplemented")
}

// InvokeSpeech2Text implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeSpeech2Text(payload *InvokeSpeech2TextRequest) (*model_entities.Speech2TextResult, error) {
	panic("unimplemented")
}

// InvokeSummary implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeSummary(payload *InvokeSummaryRequest) (*InvokeSummaryResponse, error) {
	panic("unimplemented")
}

// InvokeTTS implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeTTS(payload *InvokeTTSRequest) (*utils.Stream[model_entities.TTSResult], error) {
	panic("unimplemented")
}

// InvokeTextEmbedding implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeTextEmbedding(payload *InvokeTextEmbeddingRequest) (*model_entities.TextEmbeddingResult, error) {
	panic("unimplemented")
}

// InvokeTool implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) InvokeTool(payload *InvokeToolRequest) (*utils.Stream[tool_entities.ToolResponseChunk], error) {
	panic("unimplemented")
}

// UploadFile implements BackwardsInvocation.
func (r *RequestBackwardsInvocation) UploadFile(payload *UploadFileRequest) (*UploadFileResponse, error) {
	panic("unimplemented")
}
