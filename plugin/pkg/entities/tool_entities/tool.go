package tool_entities

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type ToolResponseChunkType string

const (
	ToolResponseChunkTypeText               ToolResponseChunkType = "text"
	ToolResponseChunkTypeFile               ToolResponseChunkType = "file"
	ToolResponseChunkTypeBlob               ToolResponseChunkType = "blob"
	ToolResponseChunkTypeBlobChunk          ToolResponseChunkType = "blob_chunk"
	ToolResponseChunkTypeJson               ToolResponseChunkType = "json"
	ToolResponseChunkTypeLink               ToolResponseChunkType = "link"
	ToolResponseChunkTypeImage              ToolResponseChunkType = "image"
	ToolResponseChunkTypeImageLink          ToolResponseChunkType = "image_link"
	ToolResponseChunkTypeVariable           ToolResponseChunkType = "variable"
	ToolResponseChunkTypeLog                ToolResponseChunkType = "log"
	ToolResponseChunkTypeRetrieverResources ToolResponseChunkType = "retriever_resources"
)

var validToolResponseChunkTypes = map[ToolResponseChunkType]bool{
	ToolResponseChunkTypeText:               true,
	ToolResponseChunkTypeFile:               true,
	ToolResponseChunkTypeBlob:               true,
	ToolResponseChunkTypeBlobChunk:          true,
	ToolResponseChunkTypeJson:               true,
	ToolResponseChunkTypeLink:               true,
	ToolResponseChunkTypeImage:              true,
	ToolResponseChunkTypeImageLink:          true,
	ToolResponseChunkTypeVariable:           true,
	ToolResponseChunkTypeLog:                true,
	ToolResponseChunkTypeRetrieverResources: true,
}

func isValidToolResponseChunkType(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validToolResponseChunkTypes[ToolResponseChunkType(value)]
}

func init() {
	validators.EntitiesValidator.RegisterValidation("tool_response_chunk_type", isValidToolResponseChunkType)
}

type ToolResponseChunk struct {
	Type    ToolResponseChunkType `json:"type" validate:"required,tool_response_chunk_type"`
	Message map[string]any        `json:"message"`
	Meta    map[string]any        `json:"meta"`
}

type GetToolRuntimeParametersResponse struct {
	Parameters []plugin_entities.ToolParameter `json:"parameters"`
}
