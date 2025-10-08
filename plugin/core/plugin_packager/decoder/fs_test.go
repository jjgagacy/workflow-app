package decoder

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createFullTestPluginDir(t *testing.T) string {
	// dir := t.TempDir()
	dir := "test_data"
	os.RemoveAll(dir)

	// 主清单文件
	files := map[string]string{
		"manifest.yaml": `type: plugin
name: test-plugin
label:
  en_US: "Test Plugin"
  zh_Hans: "测试插件"
description:
  en_US: "Test plugin for unit testing"
  zh_Hans: "单元测试插件"
author: test-author
icon: icon.png
version: "1.0.0"
created: 2023-10-01T00:00:00Z
resource:
  cpu: "100m"
  memory: 128
plugins:
  tools:
    - tools/tool_provider.yaml
  endpoints:
    - endpoints/endpoint_provider.yaml
  models:
    - models/model_provider.yaml
  agent_strategies:
    - strategies/agent_strategy_provider.yaml
meta:
  version: 0.0.1
  arch:
    - "amd64"
    - "arm64"
  runner:
    language: "python"
    version: "3.12"
    entrypoint: "main"
`,
		// 工具相关文件
		"tools/tool_provider.yaml": `identity:
  name: test-tool-provider
  label:
    en_US: "Test Tool Provider"
description:
  en_US: "Test tool provider"
tools: []
tool_files:
  - tools/calculator.yaml
  - tools/weather.yaml
`,
		"tools/calculator.yaml": `identity:
  name: calculator
  label:
    en_US: "Calculator"
description:
  description:
    en_US: "A simple calculator tool"
parameters:
  - name: a
    label:
      en_US: "First number"
    description:
      en_US: "The first number"
    type: number
    form: schema
    required: true
  - name: b  
    label:
      en_US: "Second number"
    description:
      en_US: "The second number"
    type: number
    form: schema
    required: true
`,
		"tools/weather.yaml": `identity:
  name: weather
  label:
    en_US: "Weather"
description:
  description:
    en_US: "Weather information tool"
  llm: "Get current weather information for a city"
parameters:
  - name: city
    label:
      en_US: "City name"
    description:
      en_US: "Name of the city to get weather for"
    type: string
    form: schema
    required: true
`,
		// 端点相关文件
		"endpoints/endpoint_provider.yaml": `settings:
  - name: api_key
    type: string
    required: true
    label:
      en_US: "API Key"
endpoints: []
endpoint_files:
  - endpoints/api.yaml
`,
		"endpoints/api.yaml": `path: /api/test
method: GET
description: Test API endpoint
`,
		// 模型相关文件
		"models/model_provider.yaml": `provider: test-model-provider
label:
  en_US: "Test Model Provider"
description:
  en_US: "Test model provider"
supported_model_types:
  - llm
  - text_embedding
config_methods: predefined-model
models: []
model_files:
  - "models/*.yaml"
position_files:
  llm: models/llm_position.yaml
  text_embedding: models/text_embedding_position.yaml
`,
		"models/llm_position.yaml": `- gpt-4
- gpt-3.5-turbo
- claude-2
`,
		"models/text_embedding_position.yaml": `- text-embedding-ada-002
- text-embedding-3-small
`,
		"models/gpt4.yaml": `name: gpt-4
model: gpt-4
label:
  en_US: "GPT-4"
description:
  en_US: "OpenAI GPT-4 model"
model_type: llm
`,
		"models/claude.yaml": `name: claude-2
model: claude-2
label:
  en_US: "Claude 2"
description:
  en_US: "Anthropic Claude 2 model"
model_type: llm
`,
		// Agent 策略相关文件
		"strategies/agent_strategy_provider.yaml": `identity:
  tool_provider_identity:
    name: test-agent-strategy-provider
    label:
      en_US: "Test Agent Strategy Provider"
    description:
      en_US: "Test agent strategy provider"
strategies: []
strategy_files:
  - strategies/react.yaml
  - strategies/plan_and_execute.yaml
`,
		"strategies/react.yaml": `identity:
  name: ReAct
  label:
    en_US: "ReAct Strategy"
description:
  en_US: "Reasoning and Acting strategy"
parameters:
  - name: max_iterations
    label:
      en_US: "Max Iterations"
    type: number
    default: 5
    min: 1
    max: 20
features:
  - reasoning
  - acting
`,
		"strategies/plan_and_execute.yaml": `identity:
  name: Plan-and-Execute
  label:
    en_US: "Plan and Execute"
description:
  en_US: "Plan then execute strategy"
parameters:
  - name: planning_steps
    label:
      en_US: "Planning Steps"
    type: number
    default: 3
    min: 1
    max: 10
features:
  - planning
  - execution
`,
		// 资产文件
		"_assets/icon.png": "fake-and-data",
		"_assets/logo.svg": "<svg>fake-svg</svg>",
		"_assets/config.json": `{
  "theme": "dark",
  "timeout": 30
}`,
	}

	for path, content := range files {
		fullPath := filepath.Join(dir, path)
		err := os.MkdirAll(filepath.Dir(fullPath), 0755)
		if err != nil {
			t.Fatalf("创建目录失败: %s: %v", path, err)
		}

		err = os.WriteFile(fullPath, []byte(content), 0644)
		if err != nil {
			t.Fatalf("创建文件失败 %s: %v", path, err)
		}
	}

	return dir
}

// 创建最小化测试插件目录
func createMinimalTestPluginDir(t *testing.T) string {
	dir := t.TempDir()

	files := map[string]string{
		"manifest.yaml": `name: minimal-plugin
version: 1.0.0
author: alex
plugins: {}
`,
	}

	for path, content := range files {
		fullpath := filepath.Join(dir, path)
		err := os.MkdirAll(filepath.Dir(fullpath), 0755)
		if err != nil {
			t.Fatal(err)
		}
		os.WriteFile(fullpath, []byte(content), 0644)
	}

	return dir
}

func TestPluginDecoderHelperManifest(t *testing.T) {
	t.Run("FullManifestParsing", func(t *testing.T) {
		dir := createFullTestPluginDir(t)
		decoder, err := NewFSPluginDecoder(dir)
		require.NoError(t, err)
		defer decoder.Close()

		helper := &PluginDecoderHelper{}
		decoder.PluginDecoderHelper = *helper

		manifest, err := decoder.Manifest()

		assert.NoError(t, err)
		assert.Equal(t, "test-plugin", manifest.Name)
		assert.Equal(t, "1.0.0", manifest.Version.String())
		assert.Equal(t, "test-author", manifest.Author)

		// 验证工具解析
		require.NotNil(t, manifest.Tool)
		assert.Equal(t, "test-tool-provider", manifest.Tool.Identity.Name)
		assert.Len(t, manifest.Tool.Tools, 2)
		assert.Equal(t, "calculator", manifest.Tool.Tools[0].Identity.Name)
		assert.Equal(t, "weather", manifest.Tool.Tools[1].Identity.Name)

		// 验证端点解析
		require.NotNil(t, manifest.EndPoint)
		assert.Len(t, manifest.EndPoint.EndPoints, 1)
		assert.Equal(t, "/api/test", manifest.EndPoint.EndPoints[0].Path)

		// 验证模型解析
		require.NotNil(t, manifest.Model)
		assert.Equal(t, "test-model-provider", manifest.Model.Provider)
		assert.Len(t, manifest.Model.Models, 2)
		assert.Len(t, manifest.Model.SupportedModelTypes, 2)

		// 验证能力配置
		require.NotNil(t, manifest.Model.Capability)
		require.NotNil(t, manifest.Model.Capability.LLM)
		assert.Contains(t, *manifest.Model.Capability.LLM, "gpt-4")
		require.NotNil(t, manifest.Model.Capability.TextEmbedding)
		assert.Contains(t, *manifest.Model.Capability.TextEmbedding, "text-embedding-ada-002")

		// 验证 Agent 策略
		require.NotNil(t, manifest.AgentStrategy)
		assert.Equal(t, "test-agent-strategy-provider", manifest.AgentStrategy.Identity.Name)
		assert.Len(t, manifest.AgentStrategy.Strategies, 2)
	})
}
