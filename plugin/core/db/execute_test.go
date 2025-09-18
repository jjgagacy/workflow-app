package db

import (
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func TestTransaction(t *testing.T) {
	testTransaction(t, &core.Config{
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
}

func testTransaction(t *testing.T, config *core.Config) {
	Init(config)
	defer Close()

	obj := &model.ToolInstallation{
		PluginID:               uuid.New().String(),
		PluginUniqueIdentifier: "test_tool",
		TenantID:               uuid.New().String(),
		Provider:               "openai",
	}

	if err := DB.Create(obj).Error; err != nil {
		t.Fatalf("failed to create model: %v", err)
	}

	err := WithTransaction(func(tx *gorm.DB) error {
		obj.PluginUniqueIdentifier = "updated_tool"
		if err := tx.Save(obj).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		t.Fatalf("transaction failed: %v", err)
	}

	var updatedModel model.ToolInstallation
	if err := DB.First(&updatedModel, "id = ?", obj.ID).Error; err != nil {
		t.Fatalf("failed to fetch updated model: %v", err)
	}
	if updatedModel.PluginUniqueIdentifier != "updated_tool" {
		t.Fatalf("expected PluginUniqueIdentifier to be 'updated_tool', got '%s'", updatedModel.PluginUniqueIdentifier)
	}

	err = WithTransaction(func(tx *gorm.DB) error {
		obj.PluginUniqueIdentifier = "another_update"
		if err := tx.Save(obj).Error; err != nil {
			return err
		}
		return fmt.Errorf("forcing rollback")
	})
	if err == nil {
		t.Fatalf("expected transaction to fail, but it succeeded")
	}
}
