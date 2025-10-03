package plugin_daemon

import (
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/oauth_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/requests"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func GetAuthorizationURL(
	session *session_manager.Session,
	req *requests.RequestOAuthGetAuthorizationURL,
) (
	*utils.Stream[oauth_entities.OAuthGetAuthorizationURLResult], error,
) {
	return GenericInvokePlugin[requests.RequestOAuthGetAuthorizationURL, oauth_entities.OAuthGetAuthorizationURLResult](
		session,
		req,
		1,
	)
}
