package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/db"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
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
				// todo serverless
				return
			case core.PLATFORM_LOCAL:
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
