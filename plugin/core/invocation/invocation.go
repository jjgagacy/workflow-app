package invocation

import (
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type BackwardsInvocation interface {
	// Invoke LLM
	InvokeLLM(payload *InvokeLLMRequest) (*utils.Stream[model_entities.LLMResultChunk], error)
}
