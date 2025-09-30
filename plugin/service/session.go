package service

import (
	"errors"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

func createSession[T any](
	r *plugin_entities.InvokePluginRequest[T],
	accessType plugin_daemon.PluginAccessType,
	accessAction plugin_daemon.PluginAccessAction,
) (*session_manager.Session, error) {
	manager := plugin_manager.Manager()
	if manager == nil {
		return nil, errors.New("failed to get plugin manager")
	}

	runtime, err := manager.Get(r.UniqueIdentifier)
	if err != nil {
		return nil, errors.New("failed to get plugin runtime")
	}

	session := session_manager.NewSession(
		session_manager.SessionPayload{
			TenantID:               r.TenantID,
			UserID:                 r.UserID,
			PluginUniqueIdentifier: r.UniqueIdentifier,
			AccessType:             accessType,
			AccessAction:           accessAction,
			Declaration:            runtime.Configuration(),
			BackwardsInvocation:    manager.BackwardsInvocation(),
			IgnoreCache:            true,
			ConversationID:         r.ConversationID,
			MessageID:              r.MessageID,
			AppID:                  r.AppID,
			EndPointID:             r.EndPointID,
			Context:                r.Context,
		},
	)

	session.BindRuntime(runtime)
	return session, nil
}
