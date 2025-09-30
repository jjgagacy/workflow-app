package invocation

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/tool_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type BackwardsInvocation interface {
	InvokeLLM(payload *InvokeLLMRequest) (*utils.Stream[model_entities.LLMResultChunk], error)
	InvokeLLMWithStructuredOutput(payload *InvokeLLMWithStructuredOutputRequest) (*utils.Stream[model_entities.LLMResultChunkWithStructuredOutput], error)
	InvokeTextEmbedding(payload *InvokeTextEmbeddingRequest) (*model_entities.TextEmbeddingResult, error)
	InvokeRerank(payload *InvokeRerankRequest) (*model_entities.RerankResult, error)
	InvokeTTS(payload *InvokeTTSRequest) (*utils.Stream[model_entities.TTSResult], error)
	InvokeSpeech2Text(payload *InvokeSpeech2TextRequest) (*model_entities.Speech2TextResult, error)
	InvokeModeration(payload *InvokeModerationRequest) (*model_entities.ModerationResult, error)
	InvokeTool(payload *InvokeToolRequest) (*utils.Stream[tool_entities.ToolResponseChunk], error)
	InvokeApp(payload *InvokeAppRequest) (*utils.Stream[map[string]any], error)
	InvokeParameterExtractor(payload *InvokeParameterExtractorRequest) (*InvokeNodeResponse, error)
	InvokeQuestionClassifier(payload *InvokeQuestionClassifierRequest) (*InvokeNodeResponse, error)
	InvokeEncrypt(payload *InvokeEncryptRequest) (map[string]any, error)
	InvokeSummary(payload *InvokeSummaryRequest) (*InvokeSummaryResponse, error)
	UploadFile(payload *UploadFileRequest) (*UploadFileResponse, error)
	FetchApp(payload *FetchAppRequest) (map[string]any, error)
}
