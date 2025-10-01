package generic_invoke

import (
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func getBasicPluginAccessMap(
	userId string,
	accessType access_types.PluginAccessType,
	accessAction access_types.PluginAccessAction,
) map[string]any {
	return map[string]any{
		"user_id": userId,
		"type":    accessType,
		"action":  accessAction,
	}
}
func GetInvokePluginMap(
	session *session_manager.Session,
	request any,
) map[string]any {
	req := getBasicPluginAccessMap(
		session.UserID,
		session.AccessType,
		session.AccessAction,
	)
	for k, v := range utils.StructToMap(request) {
		req[k] = v
	}
	return req
}
