package service

import (
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"gorm.io/gorm"
)

func InstallEndPoint(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	installationId string,
	tenantId string,
	userId string,
	name string,
	settings map[string]any,
) (*model.EndPoint, error) {
	installation := &model.EndPoint{
		HookID:   utils.RandomLowercaseString(16),
		PluginID: pluginUniqueIdentifier.PluginID(),
		TenantID: tenantId,
		UserID:   userId,
		Name:     name,
		Enabled:  true,
		ExpireAt: time.Date(2050, 1, 1, 0, 0, 0, 0, time.UTC),
		Settings: settings,
	}
	if err := db.WithTransaction(func(tx *gorm.DB) error {
		if err := db.Create(&installation, tx); err != nil {
			return err
		}

		return db.Run(
			db.WithTransactionContext(tx),
			db.Model(model.PluginInstallation{}),
			db.Equal("plugin_id", installation.PluginID),
			db.Equal("tenant_id", installation.TenantID),
			db.Inc(map[string]int{
				"endpoints_setups": 1,
				"endpoints_active": 1,
			}),
		)
	}); err != nil {
		return nil, err
	}

	return installation, nil
}

func GetEndPoint(
	tenantId string,
	pluginId string,
	installationId string,
) (*model.EndPoint, error) {
	endPoint, err := db.GetOne[model.EndPoint](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_id", pluginId),
		db.Equal("plugin_installation_id", installationId),
	)
	if err != nil {
		return nil, err
	}
	return &endPoint, nil
}

func UninstallEndPoint(endPointId string, tenantId string) (*model.EndPoint, error) {
	var endPoint model.EndPoint
	err := db.WithTransaction(func(tx *gorm.DB) error {
		var err error
		endPoint, err = db.GetOne[model.EndPoint](
			db.WithTransactionContext(tx),
			db.Equal("id", endPointId),
			db.Equal("tenant_id", tenantId),
			db.WLock(),
		)
		if err != nil {
			return err
		}

		if err := db.Delete(&endPoint, tx); err != nil {
			return err
		}

		// update the plugin installation
		return db.Run(
			db.WithTransactionContext(tx),
			db.Model(model.PluginInstallation{}),
			db.Equal("plugin_id", endPoint.PluginID),
			db.Equal("tenant_id", endPoint.TenantID),
			db.Dec(map[string]int{
				"endpoints_active": 1,
				"endpoints_setups": 1,
			}),
		)
	})

	if err != nil {
		return nil, err
	}

	return &endPoint, nil
}

func ApplyEndPointUpdate(
	endPoint *model.EndPoint,
	name string,
	settings map[string]any,
) error {
	endPoint.Name = name
	endPoint.Settings = settings

	return db.Update(endPoint)
}

func EnableEndPoint(endPointId string, tenantId string) error {
	return db.WithTransaction(func(tx *gorm.DB) error {
		endPoint, err := db.GetOne[model.EndPoint](
			db.WithTransactionContext(tx),
			db.Equal("id", endPointId),
			db.Equal("tenant_id", tenantId),
			db.WLock(),
		)
		if err != nil {
			return err
		}

		if endPoint.Enabled {
			return nil
		}

		endPoint.Enabled = true
		if err := db.Update(endPoint, tx); err != nil {
			return err
		}

		// update the plugin installation
		return db.Run(
			db.WithTransactionContext(tx),
			db.Model(model.PluginInstallation{}),
			db.Equal("plugin_id", endPoint.PluginID),
			db.Equal("tenant_id", endPoint.TenantID),
			db.Inc(map[string]int{
				"endpoints_active": 1,
			}),
		)
	})
}

func DisabledEndPoint(endPointId string, tenantId string) (*model.EndPoint, error) {
	var endPoint model.EndPoint
	err := db.WithTransaction(func(tx *gorm.DB) error {
		var err error
		endPoint, err = db.GetOne[model.EndPoint](
			db.WithTransactionContext(tx),
			db.Equal("id", endPointId),
			db.Equal("tenant_id", tenantId),
			db.WLock(),
		)
		if err != nil {
			return err
		}
		if !endPoint.Enabled {
			return nil
		}

		endPoint.Enabled = false
		if err := db.Update(endPoint, tx); err != nil {
			return err
		}

		// update the plugin installation
		return db.Run(
			db.WithTransactionContext(tx),
			db.Model(model.PluginInstallation{}),
			db.Equal("plugin_id", endPoint.PluginID),
			db.Equal("tenant_id", endPoint.TenantID),
			db.Dec(map[string]int{
				"endpoints_active": 1,
			}),
		)
	})
	if err != nil {
		return nil, err
	}
	return &endPoint, nil
}
