package plugintest

import (
	"encoding/json"
	"testing"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/tool_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func TestUnmarshalJsonBytes_ToolResponseChunk(t *testing.T) {
	const testData = `{
  "type": "json",
  "message": {
    "jsonObject": {
      "result": "success",
      "params": {
        "content": "parameter",
        "title": "beijing"
      }
    }
  },
  "id": "e6dba2a3-6efd-4747-8f18-4f9e0084ea50",
  "timestamp": "2026-09-18T07:36:59.997Z"
}`
	chunk, err := utils.UnmarshalJsonBytes[tool_entities.ToolResponseChunk]([]byte(testData))
	if err != nil {
		t.Fatalf("UnmarshalJsonBytes failed: %v", err)
	}

	// 1. 检查 Type
	if chunk.Type != "json" {
		t.Errorf("expected Type=json, got %q", chunk.Type)
	}

	// 2. 检查 Message 存在
	if chunk.Message == nil {
		t.Fatal("Message is nil")
	}

	// 3. 检查 message.jsonObject
	jsonObject, ok := chunk.Message["jsonObject"].(map[string]any)
	if !ok {
		t.Fatalf("message.jsonObject is not a map, got %T", chunk.Message["jsonObject"])
	}

	// 4. 检查 jsonObject.result
	if result, _ := jsonObject["result"].(string); result != "success" {
		t.Errorf("expected result=success, got %v", jsonObject["result"])
	}

	// 5. 检查 jsonObject.params
	params, ok := jsonObject["params"].(map[string]any)
	if !ok {
		t.Fatalf("params is not a map, got %T", jsonObject["params"])
	}
	if content, _ := params["content"].(string); content != "parameter" {
		t.Errorf("expected content=parameter, got %v", params["content"])
	}
	if title, _ := params["title"].(string); title != "beijing" {
		t.Errorf("expected title=beijing, got %v", params["title"])
	}

	// 6. 可选：打印完整结构，方便调试
	pretty, _ := json.MarshalIndent(chunk, "", "  ")
	t.Logf("parsed ToolResponseChunk:\n%s", pretty)
}

func TestUnmarshalJsonBytes_ToolResponseChunk_StringWrapped(t *testing.T) {
	const testData = `"{\"type\":\"json\",\"message\":{\"jsonObject\":{\"result\":\"success\",\"params\":{\"content\":\"parameter\",\"title\":\"beijing\"}}}}"`

	chunk, err := utils.UnmarshalJsonBytes[tool_entities.ToolResponseChunk]([]byte(testData))
	if err != nil {
		t.Fatalf("UnmarshalJsonBytes should accept a string-wrapped JSON payload: %v", err)
	}
	if chunk.Type != "json" {
		t.Fatalf("expected Type=json, got %q", chunk.Type)
	}
	if chunk.Message == nil {
		t.Fatal("Message is nil")
	}
}
