package service

import (
	"testing"

	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func setUpTestDB() *gorm.DB {
	db.Init(&core.Config{
		DBType:            "postgresql",
		DBHost:            "localhost",
		DBPort:            5432,
		DBDatabase:        "workflow_plugin",
		DBDefaultDatabase: "",
		DBUsername:        "alex",
		DBPassword:        stringPtr(""),
		DBSslMode:         "disable",

		DBMaxIdleConns:    10,
		DBMaxOpenConns:    30,
		DBConnMaxLifetime: 3600,
		DBExtras:          "",
		DBCharset:         "utf8",
		DBTimeZone:        "Asia/Shanghai",
	})

	return db.DB
}

func TestAutomicInstallPlugin(t *testing.T) {
	setUpTestDB()
	defer db.Close()

	tenantID := uuid.New().String()
	pluginID := "test-plugin"
	pluginUID := plugin_entities.PluginUniqueIdentifier("test-author/" + pluginID + ":1.0.0")
	installType := plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
	source := "local"
	meta := map[string]any{"version": "1.0.0"}

	toolIdentity := plugin_entities.ToolProviderIdentity{
		Author:      "openai",
		Name:        "gpt-4",
		Description: plugin_entities.I18nObject{EnUs: "Advanced AI assistant", ZhHans: "高级AI助手"},
		Icon:        "https://example.com/icon.png",
		IconDark:    "https://example.com/icon-dark.png",
		Label:       plugin_entities.I18nObject{EnUs: "GPT-4", ZhHans: "GPT-4"},
		Tags:        []manifest_entites.PluginTag{"ai", "assistant"},
	}

	declaration := &plugin_entities.PluginDeclaration{
		AgentStrategy: &plugin_entities.AgentStrategyProviderDeclaration{
			Identity: plugin_entities.AgentStrategyProviderIdentity{
				ToolProviderIdentity: toolIdentity,
			},
		},
		Model: &plugin_entities.ModelProviderDeclaration{
			Provider: "openai",
		},
	}

	t.Run("successfull new plugin installation", func(t *testing.T) {
		plugin, installation, err := AtomicInstallPlugin(
			tenantID,
			pluginUID,
			installType,
			declaration,
			source,
			meta,
		)
		// 断言
		assert.NoError(t, err)
		assert.NotNil(t, plugin)
		assert.NotNil(t, installation)
		assert.Equal(t, pluginID, plugin.PluginID)
		assert.Equal(t, tenantID, installation.TenantID)

		// 验证数据库中的记录
		var dbPlugin model.Plugin
		dbPlugin, err = db.GetOne[model.Plugin](
			db.Equal("plugin_id", pluginID),
		)
		assert.NoError(t, err)
		assert.Equal(t, dbPlugin.PluginID, pluginID)

		var dbPluginInstallation model.PluginInstallation
		dbPluginInstallation, err = db.GetOne[model.PluginInstallation](
			db.Equal("plugin_id", pluginID),
			db.Equal("tenant_id", tenantID),
			db.Equal("runtime_type", string(installType)),
		)
		assert.NoError(t, err)
		assert.Equal(t, dbPluginInstallation.PluginID, pluginID)

		var dbAgentStragegyInstallation model.AgentStrategyInstallation
		dbAgentStragegyInstallation, err = db.GetOne[model.AgentStrategyInstallation](
			db.Equal("plugin_id", pluginID),
			db.Equal("tenant_id", tenantID),
			db.Equal("plugin_unique_identifier", string(pluginUID.String())),
			db.Equal("provider", declaration.AgentStrategy.Identity.Name),
		)
		assert.NoError(t, err)
		assert.Equal(t, dbAgentStragegyInstallation.PluginID, pluginID)

		var aiModelInstallation model.AIModelInstallation
		aiModelInstallation, err = db.GetOne[model.AIModelInstallation](
			db.Equal("plugin_id", pluginID),
			db.Equal("tenant_id", tenantID),
			db.Equal("plugin_unique_identifier", string(pluginUID.String())),
			db.Equal("provider", declaration.Model.Provider),
		)
		assert.NoError(t, err)
		assert.Equal(t, pluginID, aiModelInstallation.PluginID)

	})
}
