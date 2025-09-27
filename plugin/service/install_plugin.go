package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/model"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"gorm.io/gorm"
)

type InstallPluginResponse struct {
	AllInstalled bool   `json:"all_installed"`
	TaskID       string `json:"task_id"`
}

type InstallPluginDoneHandler func(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	declaration *plugin_entities.PluginDeclaration,
	meta map[string]any,
) error

func InstallPluginFromIdentifier(
	config *core.Config,
	tenantId string,
	pluginUniqueIdentifiers []plugin_entities.PluginUniqueIdentifier,
	source string,
	metas []map[string]any,
) *entities.Response {
	response, err := InstallPluginRuntimeToTenant(
		config,
		tenantId,
		pluginUniqueIdentifiers,
		source,
		metas,
		func(
			pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
			declaration *plugin_entities.PluginDeclaration,
			meta map[string]any,
		) error {
			runtimeType := plugin_entities.PluginRuntimeType("")

			switch config.Platform {
			case core.PLATFORM_SERVERLESS:
				runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_SERVERLESS
			case core.PLATFORM_LOCAL:
				runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
			default:
				return fmt.Errorf("unsupported platform: %s", config.Platform)
			}

			_, _, err := AtomicInstallPlugin(
				tenantId,
				pluginUniqueIdentifier,
				runtimeType,
				declaration,
				source,
				meta,
			)
			return err
		},
	)

	if err != nil {
		if errors.Is(err, types.ErrPluginAlreadyExists) {
			return entities.BadRequestError(err).ToResponse()
		}
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(response)
}

func InstallPluginRuntimeToTenant(
	config *core.Config,
	tenantId string,
	pluginUniqueIdentifiers []plugin_entities.PluginUniqueIdentifier,
	source string,
	metas []map[string]any,
	done InstallPluginDoneHandler,
) (*InstallPluginResponse, error) {
	response := &InstallPluginResponse{}
	pluginWaitingInstallations := []plugin_entities.PluginUniqueIdentifier{}

	runtimeType := plugin_entities.PluginRuntimeType("")
	switch config.Platform {
	case core.PLATFORM_LOCAL:
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
	case core.PLATFORM_SERVERLESS:
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_SERVERLESS
	default:
		return nil, fmt.Errorf("unsupported platform: %s", config.Platform)
	}

	task := &model.TaskInstallation{
		Status:           model.TaskInstallStatusRunning,
		TenantID:         tenantId,
		TotalPlugins:     len(pluginUniqueIdentifiers),
		CompletedPlugins: 0,
		Plugins:          []model.TaskPluginInstallStatus{},
	}

	for i, pluginUniqueIdentifier := range pluginUniqueIdentifiers {
		// before installing, we need to ensure pkg is uploaded
		pluginDeclaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			runtimeType,
		)
		if err != nil {
			return nil, err
		}

		// check if plugin is installed
		_, err = db.GetOne[model.Plugin](
			db.Equal("plugin_unique_identifier", pluginUniqueIdentifier.String()),
		)

		task.Plugins = append(task.Plugins, model.TaskPluginInstallStatus{
			PluginUniqueIdentifier: pluginUniqueIdentifier,
			PluginID:               pluginUniqueIdentifier.PluginID(),
			Status:                 model.TaskInstallStatusPending,
			Icon:                   pluginDeclaration.Icon,
			IconDark:               pluginDeclaration.IconDark,
			Label:                  pluginDeclaration.Label,
			Message:                "",
		})

		if err == nil {
			if err := done(pluginUniqueIdentifier, pluginDeclaration, metas[i]); err != nil {
				return nil, errors.Join(err, errors.New("failed on plugin installation"))
			} else {
				task.CompletedPlugins++
				task.Plugins[i].Status = model.TaskInstallStatusSuccess
				task.Plugins[i].Message = "Installed"
			}

			continue
		}

		if err != types.ErrPluginNotFound {
			return nil, err
		}

		pluginWaitingInstallations = append(pluginWaitingInstallations, pluginUniqueIdentifier)
	}

	if len(pluginWaitingInstallations) == 0 {
		response.AllInstalled = true
		response.TaskID = ""
		return response, nil
	}

	err := db.Create(task)
	if err != nil {
		return nil, err
	}

	response.TaskID = task.ID
	manager := plugin_manager.Manager()

	tasks := []func(){}
	for i, pluginUniqueIdentifier := range pluginWaitingInstallations {
		// copy the variable to avoid race condition
		pluginUniqueIdentifier := pluginUniqueIdentifier

		declaration, err := cache.CombinedGetPluginDeclaration(
			pluginUniqueIdentifier,
			runtimeType,
		)

		if err != nil {
			return nil, err
		}

		i := i
		tasks = append(tasks, func() {
			updateTaskStatus := func(modifier func(taskInstallation *model.TaskInstallation, pluginInstallation *model.TaskPluginInstallStatus)) {
				if err := db.WithTransaction(func(tx *gorm.DB) error {
					task, err := db.GetOne[model.TaskInstallation](
						db.WithTransactionContext(tx),
						db.Equal("id", task.ID),
						db.WLock(), // write lock, multiple tasks can't update the same task
					)
					if err == types.ErrRecordNotFound {
						return nil
					}

					if err != nil {
						return err
					}

					updateTask := &task
					var pluginStatus *model.TaskPluginInstallStatus
					for i := range task.Plugins {
						if task.Plugins[i].PluginUniqueIdentifier == pluginUniqueIdentifier {
							pluginStatus = &task.Plugins[i]
							break
						}
					}

					if pluginStatus == nil {
						return nil
					}

					modifier(updateTask, pluginStatus)

					suc := 0
					for _, plugin := range updateTask.Plugins {
						if plugin.Status == model.TaskInstallStatusSuccess {
							suc++
						}
					}

					if suc == len(updateTask.Plugins) {
						// update status
						updateTask.Status = model.TaskInstallStatusSuccess
						// delete the task
						time.AfterFunc(120*time.Second, func() {
							db.Delete(updateTask)
						})
					}

					return db.Update(updateTask, tx)
				}); err != nil {
					utils.Error("failed to update TaskInstallStatus %s", err.Error())
					return
				}
			}

			// Update installing
			updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
				plugin.Status = model.TaskInstallStatusRunning
				plugin.Message = "Installing"
			})

			// Update from stream
			var stream *utils.Stream[plugin_manager.PluginInstallResponse]
			switch config.Platform {
			case core.PLATFORM_SERVERLESS:
				// todo: isntall serverless
				return
			case core.PLATFORM_LOCAL:
				// install local plugin
				stream, err = manager.InstallLocal(pluginUniqueIdentifier)
			default:
				updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
					task.Status = model.TaskInstallStatusFailed
					plugin.Status = model.TaskInstallStatusFailed
					plugin.Message = "Unsupported platform"
				})
				return
			}

			if err != nil {
				updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
					task.Status = model.TaskInstallStatusFailed
					plugin.Status = model.TaskInstallStatusFailed
					plugin.Message = err.Error()
				})
				return
			}

			for stream.Next() {
				message, err := stream.Read()
				if err != nil {
					updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
						task.Status = model.TaskInstallStatusFailed
						plugin.Status = model.TaskInstallStatusFailed
						plugin.Message = err.Error()
					})
					return
				}

				if message.Event == plugin_manager.PluginInstallEventError {
					updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
						task.Status = model.TaskInstallStatusFailed
						plugin.Status = model.TaskInstallStatusFailed
						plugin.Message = message.Data
					})
					return
				}

				if message.Event == plugin_manager.PluginInstallEventDone {
					if err := done(pluginUniqueIdentifier, declaration, metas[i]); err != nil {
						updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
							task.Status = model.TaskInstallStatusFailed
							plugin.Status = model.TaskInstallStatusFailed
							plugin.Message = "Failed to create plugin, perhaps it's already installed"
						})
						return
					}
				}
			}

			updateTaskStatus(func(task *model.TaskInstallation, plugin *model.TaskPluginInstallStatus) {
				plugin.Status = model.TaskInstallStatusSuccess
				plugin.Message = "Installed"
				task.CompletedPlugins++

				if task.CompletedPlugins == task.TotalPlugins {
					task.Status = model.TaskInstallStatusSuccess
				}
			})
		})
	}

	// submit async tasks
	utils.WithMaxRoutine(5, tasks)

	return response, nil
}

func UpgradePlugin(
	config *core.Config,
	tenantId string,
	source string,
	meta map[string]any,
	originalPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	newPluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) *entities.Response {
	if originalPluginUniqueIdentifier == newPluginUniqueIdentifier {
		return entities.BadRequestError(errors.New("original and new plugin unique identifier are the same")).ToResponse()
	}

	if originalPluginUniqueIdentifier.PluginID() != newPluginUniqueIdentifier.PluginID() {
		return entities.BadRequestError(errors.New("original and new plugin id are different")).ToResponse()
	}

	installation, err := db.GetOne[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
		db.Equal("plugin_unique_identifier", originalPluginUniqueIdentifier.String()),
		db.Equal("source", source),
	)

	if err == types.ErrRecordNotFound {
		return entities.NotFoundError(errors.New("plugin installation not found for this tenant")).ToResponse()
	}

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	response, err := InstallPluginRuntimeToTenant(
		config,
		tenantId,
		[]plugin_entities.PluginUniqueIdentifier{newPluginUniqueIdentifier},
		source,
		[]map[string]any{meta},
		func(
			pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
			declaration *plugin_entities.PluginDeclaration,
			meta map[string]any,
		) error {
			originalDeclaration, err := cache.CombinedGetPluginDeclaration(
				originalPluginUniqueIdentifier,
				plugin_entities.PluginRuntimeType(installation.RuntimeType),
			)
			if err != nil {
				return err
			}

			newDeclaration, err := cache.CombinedGetPluginDeclaration(
				newPluginUniqueIdentifier,
				plugin_entities.PluginRuntimeType(installation.RuntimeType),
			)
			if err != nil {
				return err
			}

			// Uninstall the original plugin
			upgradeResponse, err := AtomicUpgradePlugin(
				tenantId,
				originalPluginUniqueIdentifier,
				newPluginUniqueIdentifier,
				originalDeclaration,
				newDeclaration,
				plugin_entities.PluginRuntimeType(installation.RuntimeType),
				source,
				meta,
			)
			if err != nil {
				return err
			}

			if upgradeResponse.OriginalPluginDeleted {
				manager := plugin_manager.Manager()
				if string(upgradeResponse.DeletedPlugin.InstallType) == string(plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL) {
					err := manager.UninstallFromLocal(
						plugin_entities.PluginUniqueIdentifier(upgradeResponse.DeletedPlugin.PluginUniqueIdentifier),
					)
					if err != nil {
						return err
					}
				}
			}
			return nil
		},
	)

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(response)
}

// Decode a plugin from a given identifier, this ensure that the plugin
// is valid when upload a plugin in
func DecodePluginFromIdentifier(
	config *core.Config,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) *entities.Response {
	manager := plugin_manager.Manager()
	pkgFile, err := manager.GetPackage(pluginUniqueIdentifier)
	if err != nil {
		return entities.BadRequestError(err).ToResponse()
	}

	zipDecoder, err := decoder.NewZipPluginDecoderWithConfig(
		pkgFile,
		&decoder.ThirdPartySignatureVerificationConfig{
			Enabled:        config.ThirdPartySignatureVerificationEnabled,
			PublicKeyPaths: config.ThirdPartySignatureVerificationPublicKeys,
		},
	)
	if err != nil {
		return entities.BadRequestError(err).ToResponse()
	}

	declaration, err := zipDecoder.Manifest()
	if err != nil {
		return entities.BadRequestError(err).ToResponse()
	}

	return entities.NewSuccessResponse(map[string]any{
		"unique_identifier": pluginUniqueIdentifier,
		"manifest":          declaration,
	})
}

func FetchPluginFromIdentifier(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) *entities.Response {
	_, err := db.GetOne[model.Plugin](
		db.Equal("plugin_unique_identifier", string(pluginUniqueIdentifier)),
	)
	if err == types.ErrRecordNotFound {
		return entities.NewSuccessResponse(false)
	}

	return entities.NewSuccessResponse(true)
}

func UninstallPlugin(
	tenantId string,
	pluginInstallationId string,
) *entities.Response {
	installation, err := db.GetOne[model.PluginInstallation](
		db.Equal("tenant_id", tenantId),
		db.Equal("id", pluginInstallationId),
	)
	if err == types.ErrRecordNotFound {
		return entities.PluginNotFoundError(errors.New("plugin not found")).ToResponse()
	}
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	pluginUniqueIdentifier, err := plugin_entities.NewPluginUniqueIdentifier(installation.PluginUniqueIdentifier)
	if err != nil {
		return entities.UniqueIdentifierInvalidError(err).ToResponse()
	}

	declaration, err := cache.CombinedGetPluginDeclaration(
		pluginUniqueIdentifier,
		plugin_entities.PluginRuntimeType(installation.RuntimeType),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	// Uninstall the plugin
	uninstallResponse, err := AtomicUninstallPlugin(
		tenantId,
		pluginUniqueIdentifier,
		installation.ID,
		declaration,
	)
	if err != nil {
		return entities.InternalError(fmt.Errorf("failed to uninstall plugin: %s", err.Error())).ToResponse()
	}

	if uninstallResponse.PluginDeleted {
		manager := plugin_manager.Manager()
		if uninstallResponse.Installation.RuntimeType == string(plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL) {
			err = manager.UninstallFromLocal(pluginUniqueIdentifier)
			if err != nil {
				return entities.InternalError(fmt.Errorf("failed to uninstall plugin: %s", err.Error())).ToResponse()
			}
		}
	}

	return entities.NewSuccessResponse(true)
}

func FetchPluginInstallationTasks(
	tenantId string,
	page int,
	pageSize int,
) *entities.Response {
	tasks, err := db.GetAll[model.TaskInstallation](
		db.Equal("tenant_id", tenantId),
		db.OrderBy("created_at", true),
		db.Page(page, pageSize),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(tasks)
}

func FetchPluginInstallationTask(
	tenantId string,
	taskId string,
) *entities.Response {
	task, err := db.GetOne[model.TaskInstallation](
		db.Equal("id", taskId),
		db.Equal("tenant_id", tenantId),
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(task)
}

func DeleteAllPluginInstallationTasks(
	tenantId string,
) *entities.Response {
	err := db.DeleteBy(
		model.TaskInstallation{
			TenantID: tenantId,
		},
	)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}

func DeletePluginInstallationTask(
	tenantId string,
	taskId string,
) *entities.Response {
	err := db.DeleteBy(model.TaskInstallation{
		Model:    model.Model{ID: taskId},
		TenantID: tenantId,
	})
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}

func DeletePluginInstallationItemFromTask(
	tenantId string,
	taskId string,
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) *entities.Response {
	err := db.WithTransaction(func(tx *gorm.DB) error {
		taskInstallation, err := db.GetOne[model.TaskInstallation](
			db.WithTransactionContext(tx),
			db.Equal("id", taskId),
			db.Equal("tenant_id", tenantId),
			db.WLock(),
		)

		if err != nil {
			return err
		}

		plugins := []model.TaskPluginInstallStatus{}
		for _, plugin := range taskInstallation.Plugins {
			if plugin.PluginUniqueIdentifier != pluginUniqueIdentifier {
				plugins = append(plugins, plugin)
			}
		}

		success := 0
		for _, plugin := range plugins {
			if plugin.Status == model.TaskInstallStatusSuccess {
				success++
			}
		}

		if len(plugins) == success {
			err = db.Delete(&taskInstallation, tx)
		} else {
			taskInstallation.Plugins = plugins
			err = db.Update(&taskInstallation, tx)
		}

		return err
	})

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(true)
}
