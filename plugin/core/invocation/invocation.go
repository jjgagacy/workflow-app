package invocation

import (
	"github.com/jjgagacy/workflow-app/plugin/core/stream"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
)

type BackwardsInvocation interface {
	// Invoke LLM
	InvokeLLM(payload *InvokeLLMRequest) (*stream.Stream[model_entities.LLMResultChunk], error)
}
