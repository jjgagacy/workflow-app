package invocation

import (
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/model_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/tool_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type MockInvocation struct{}

func NewMockedInvocation() BackwardsInvocation {
	return &MockInvocation{}
}

// FetchApp implements BackwardsInvocation.
func (m *MockInvocation) FetchApp(payload *FetchAppRequest) (map[string]any, error) {
	return map[string]any{
		"name": "test",
	}, nil
}

// InvokeApp implements BackwardsInvocation.
func (m *MockInvocation) InvokeApp(payload *InvokeAppRequest) (*utils.Stream[map[string]any], error) {
	stream := utils.NewStream[map[string]any](5)
	utils.Submit(nil, func() {
		stream.Write(map[string]any{
			"event":           "agent_message",
			"message_id":      "5ad4cb98-f0c7-4085-b384-88c403be6290",
			"conversation_id": "45701982-8118-4bc5-8e9b-64562b4555f2",
			"answer":          "hello",
			"created_at":      time.Now().Unix(),
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(map[string]any{
			"event":           "agent_message",
			"message_id":      "5ad4cb98-f0c7-4085-b384-88c403be6290",
			"conversation_id": "45701982-8118-4bc5-8e9b-64562b4555f2",
			"answer":          "world",
			"created_at":      time.Now().Unix(),
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(map[string]any{
			"event":           "agent_message",
			"message_id":      "5ad4cb98-f0c7-4085-b384-88c403be6290",
			"conversation_id": "45701982-8118-4bc5-8e9b-64562b4555f2",
			"answer":          "!",
			"created_at":      time.Now().Unix(),
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(map[string]any{
			"event":           "message_end",
			"id":              "5e52ce04-874b-4d27-9045-b3bc80def685",
			"conversation_id": "45701982-8118-4bc5-8e9b-64562b4555f2",
			"created_at":      time.Now().Unix(),
			"metadata": map[string]any{
				"retriever_resources": []map[string]any{
					{
						"position":      1,
						"dataset_id":    "101b4c97-fc2e-463c-90b1-5261a4cdcafb",
						"dataset_name":  "dataset",
						"document_id":   "8dd1ad74-0b5f-4175-b735-7d98bbbb4e00",
						"document_name": "title",
						"score":         0.98457545,
						"content":       "content",
					},
				},
				"usage": map[string]any{
					"prompt_tokens":         1033,
					"prompt_unit_price":     "0.001",
					"prompt_price_unit":     "0.001",
					"prompt_price":          "0.0010330",
					"completion_tokens":     135,
					"completion_unit_price": "0.002",
					"completion_price_unit": "0.001",
					"completion_price":      "0.0002700",
					"total_tokens":          1168,
					"total_price":           "0.0013030",
					"currency":              "USD",
					"latency":               1.381760165997548,
				},
			},
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(map[string]any{
			"event":           "message_file",
			"id":              "5e52ce04-874b-4d27-9045-b3bc80def685",
			"conversation_id": "45701982-8118-4bc5-8e9b-64562b4555f2",
			"belongs_to":      "assistant",
			"url":             "https://ipspot.nl",
			"created_at":      time.Now().Unix(),
		})
		time.Sleep(100 * time.Millisecond)
		stream.Close()
	})
	return stream, nil
}

// InvokeEncrypt implements BackwardsInvocation.
func (m *MockInvocation) InvokeEncrypt(payload *InvokeEncryptRequest) (map[string]any, error) {
	return payload.Data, nil
}

// InvokeLLM implements BackwardsInvocation.
func (m *MockInvocation) InvokeLLM(payload *InvokeLLMRequest) (*utils.Stream[model_entities.LLMResultChunk], error) {
	stream := utils.NewStream[model_entities.LLMResultChunk](5)
	utils.Submit(nil, func() {
		if len(payload.Tools) > 0 {
			tool := payload.Tools[0]
			arguments, err := utils.GenerateValidateJson(tool.Parameters)
			if err != nil {
				stream.WriteError(err)
				return
			}
			stream.WriteBlocking(model_entities.LLMResultChunk{
				Model:             model_entities.LLMModel(payload.Model),
				SystemFingerprint: "test",
				Delta: model_entities.LLMResultChunkDelta{
					Index: utils.ToPtr(0),
					Message: model_entities.PromptMessage{
						Role: model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
						ToolCalls: []model_entities.PromptMessageToolCall{
							{
								ID:   "123",
								Type: "function",
								Function: struct {
									Name      string "json:\"name\""
									Arguments string "json:\"arguments\""
								}{
									Name:      tool.Name,
									Arguments: utils.MarshalJson(arguments),
								},
							},
						},
					},
				},
			})
		}
		stream.Write(model_entities.LLMResultChunk{
			Model:             model_entities.LLMModel(payload.Model),
			SystemFingerprint: "test",
			Delta: model_entities.LLMResultChunkDelta{
				Index: &[]int{1}[0],
				Message: model_entities.PromptMessage{
					Role:      model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
					Content:   "hello",
					Name:      "test",
					ToolCalls: []model_entities.PromptMessageToolCall{},
				},
			},
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(model_entities.LLMResultChunk{
			Model:             model_entities.LLMModel(payload.Model),
			SystemFingerprint: "test",
			Delta: model_entities.LLMResultChunkDelta{
				Index: &[]int{1}[0],
				Message: model_entities.PromptMessage{
					Role:      model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
					Content:   " world",
					Name:      "test",
					ToolCalls: []model_entities.PromptMessageToolCall{},
				},
			},
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(model_entities.LLMResultChunk{
			Model:             model_entities.LLMModel(payload.Model),
			SystemFingerprint: "test",
			Delta: model_entities.LLMResultChunkDelta{
				Index: &[]int{2}[0],
				Message: model_entities.PromptMessage{
					Role:      model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
					Content:   " world",
					Name:      "test",
					ToolCalls: []model_entities.PromptMessageToolCall{},
				},
			},
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(model_entities.LLMResultChunk{
			Model:             model_entities.LLMModel(payload.Model),
			SystemFingerprint: "test",
			Delta: model_entities.LLMResultChunkDelta{
				Index: &[]int{3}[0],
				Message: model_entities.PromptMessage{
					Role:      model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
					Content:   " !",
					Name:      "test",
					ToolCalls: []model_entities.PromptMessageToolCall{},
				},
			},
		})
		time.Sleep(100 * time.Millisecond)
		stream.Write(model_entities.LLMResultChunk{
			Model:             model_entities.LLMModel(payload.Model),
			SystemFingerprint: "test",
			Delta: model_entities.LLMResultChunkDelta{
				Index: &[]int{3}[0],
				Message: model_entities.PromptMessage{
					Role:      model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
					Content:   " !",
					Name:      "test",
					ToolCalls: []model_entities.PromptMessageToolCall{},
				},
				Usage: &model_entities.LLMUsage{
					PromptTokens:     &[]int{100}[0],
					CompletionTokens: &[]int{100}[0],
					TotalTokens:      &[]int{200}[0],
					Latency:          &[]float64{0.4}[0],
					Currency:         &[]string{"USD"}[0],
				},
			},
		})
		stream.Close()
	})

	return stream, nil
}

// InvokeLLMWithStructuredOutput implements BackwardsInvocation.
func (m *MockInvocation) InvokeLLMWithStructuredOutput(payload *InvokeLLMWithStructuredOutputRequest) (*utils.Stream[model_entities.LLMResultChunkWithStructuredOutput], error) {
	structuredOutput, err := utils.GenerateValidateJson(payload.StructuredOutputSchema)
	if err != nil {
		return nil, err
	}
	structuredOutputString := utils.MarshalJson(structuredOutput)
	// Split structuredOutputString into 10 parts and write them to stream
	parts := []string{}
	for i := range 10 {
		start := i * len(structuredOutputString) / 10
		end := (i + 1) * len(structuredOutputString) / 10
		if i == 9 {
			end = len(structuredOutputString)
		}
		parts = append(parts, structuredOutputString[start:end])
	}

	stream := utils.NewStream[model_entities.LLMResultChunkWithStructuredOutput](11)
	utils.Submit(nil, func() {
		for i, part := range parts {
			stream.Write(model_entities.LLMResultChunkWithStructuredOutput{
				Model:             model_entities.LLMModel(payload.Mode),
				SystemFingerprint: "test",
				Delta: model_entities.LLMResultChunkDelta{
					Index: &[]int{i}[0],
					Message: model_entities.PromptMessage{
						Role:      model_entities.PROMPT_MESSAGE_ROLE_ASSISTANT,
						Content:   part,
						Name:      "test",
						ToolCalls: []model_entities.PromptMessageToolCall{},
					},
				},
			})
		}
		// Write the last part
		stream.Write(model_entities.LLMResultChunkWithStructuredOutput{
			Model:             model_entities.LLMModel(payload.Model),
			SystemFingerprint: "test",
			Delta: model_entities.LLMResultChunkDelta{
				Index: &[]int{10}[0],
			},
			LLMStructuredOutput: model_entities.LLMStructuredOutput{
				StructuredOutput: structuredOutput,
			},
		})
	})

	return stream, nil
}

// InvokeModeration implements BackwardsInvocation.
func (m *MockInvocation) InvokeModeration(payload *InvokeModerationRequest) (*model_entities.ModerationResult, error) {
	result := model_entities.ModerationResult{
		Result: true,
	}
	return &result, nil
}

// InvokeParameterExtractor implements BackwardsInvocation.
func (m *MockInvocation) InvokeParameterExtractor(payload *InvokeParameterExtractorRequest) (*InvokeNodeResponse, error) {
	resp := &InvokeNodeResponse{
		ProcessData: map[string]any{},
		Outputs:     map[string]any{},
		Inputs: map[string]any{
			"query": payload.Query,
		},
	}

	for _, parameter := range payload.Parameters {
		typ := parameter.Type
		switch typ {
		case "string":
			resp.Outputs[parameter.Name] = "Never gonna give you up ~"
		case "number":
			resp.Outputs[parameter.Name] = 1234567890
		case "bool":
			resp.Outputs[parameter.Name] = true
		case "select":
			options := parameter.Options
			if len(options) == 0 {
				resp.Outputs[parameter.Name] = "Never gonna let you down ~"
			} else {
				resp.Outputs[parameter.Name] = options[0]
			}
		case "array[string]":
			resp.Outputs[parameter.Name] = []string{
				"Never gonna run around and desert you ~",
				"Never gonna make you cry ~",
				"Never gonna say goodbye ~",
				"Never gonna tell a lie and hurt you ~",
			}
		case "array[number]":
			resp.Outputs[parameter.Name] = []int{114, 514, 1919, 810}
		case "array[bool]":
			resp.Outputs[parameter.Name] = []bool{true, false, true, false, true, false, true, false, true, false}
		case "array[object]":
			resp.Outputs[parameter.Name] = []map[string]any{
				{
					"name": "alex",
					"age":  55555,
				},
				{
					"name": "xu",
					"age":  99999,
				},
			}
		}
	}

	return resp, nil
}

// InvokeQuestionClassifier implements BackwardsInvocation.
func (m *MockInvocation) InvokeQuestionClassifier(payload *InvokeQuestionClassifierRequest) (*InvokeNodeResponse, error) {
	return &InvokeNodeResponse{
		ProcessData: map[string]any{},
		Outputs: map[string]any{
			"class_name": payload.Classes[0].Name,
		},
		Inputs: map[string]any{},
	}, nil
}

// InvokeRerank implements BackwardsInvocation.
func (m *MockInvocation) InvokeRerank(payload *InvokeRerankRequest) (*model_entities.RerankResult, error) {
	result := model_entities.RerankResult{
		Model: payload.Model,
	}
	for i, doc := range payload.Docs {
		result.Docs = append(result.Docs, model_entities.RerankDocument{
			Index: &[]int{i}[0],
			Score: &[]float64{0.1}[0],
			Text:  &doc,
		})
	}
	return &result, nil
}

// InvokeSpeech2Text implements BackwardsInvocation.
func (m *MockInvocation) InvokeSpeech2Text(payload *InvokeSpeech2TextRequest) (*model_entities.Speech2TextResult, error) {
	result := model_entities.Speech2TextResult{
		Result: "Hello World",
	}
	return &result, nil
}

// InvokeSummary implements BackwardsInvocation.
func (m *MockInvocation) InvokeSummary(payload *InvokeSummaryRequest) (*InvokeSummaryResponse, error) {
	return &InvokeSummaryResponse{
		Summary: payload.Text,
	}, nil
}

// InvokeTTS implements BackwardsInvocation.
func (m *MockInvocation) InvokeTTS(payload *InvokeTTSRequest) (*utils.Stream[model_entities.TTSResult], error) {
	stream := utils.NewStream[model_entities.TTSResult](5)
	utils.Submit(nil, func() {
		for range 10 {
			stream.Write(model_entities.TTSResult{
				Result: "a1b2c3d4",
			})
			time.Sleep(100 * time.Millisecond)
		}
	})
	return stream, nil
}

// InvokeTextEmbedding implements BackwardsInvocation.
func (m *MockInvocation) InvokeTextEmbedding(payload *InvokeTextEmbeddingRequest) (*model_entities.TextEmbeddingResult, error) {
	result := model_entities.TextEmbeddingResult{
		Model: payload.Model,
		Usage: model_entities.EmbeddingUsage{
			Tokens:      &[]int{100}[0],
			TotalTokens: &[]int{100}[0],
			Latency:     &[]float64{0.1}[0],
			Currency:    &[]string{"USD"}[0],
		},
	}

	for range payload.Texts {
		result.Embeddings = append(result.Embeddings, []float64{0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0})
	}

	return &result, nil
}

// InvokeTool implements BackwardsInvocation.
func (m *MockInvocation) InvokeTool(payload *InvokeToolRequest) (*utils.Stream[tool_entities.ToolResponseChunk], error) {
	stream := utils.NewStream[tool_entities.ToolResponseChunk](5)
	utils.Submit(nil, func() {
		for range 10 {
			stream.Write(tool_entities.ToolResponseChunk{
				Type: tool_entities.ToolResponseChunkTypeText,
				Message: map[string]any{
					"text": "hello world",
				},
			})
			time.Sleep(100 * time.Millisecond)
		}
	})
	return stream, nil
}

// UploadFile implements BackwardsInvocation.
func (m *MockInvocation) UploadFile(payload *UploadFileRequest) (*UploadFileResponse, error) {
	return &UploadFileResponse{
		URL: "https://ipspot.nl",
	}, nil
}
