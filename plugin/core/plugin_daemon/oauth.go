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

func GetCredentials(
	session *session_manager.Session,
	req *requests.RequestOAuthGetCredentials,
) (
	*utils.Stream[oauth_entities.OAuthGetCredentialsResult], error,
) {
	return GenericInvokePlugin[requests.RequestOAuthGetCredentials, oauth_entities.OAuthGetCredentialsResult](
		session,
		req,
		1,
	)
}

func RefreshCredentials(
	session *session_manager.Session,
	req *requests.RequestOauthRefreshCredentials,
) (
	*utils.Stream[oauth_entities.OAuthRefreshCredentialsResult], error,
) {
	return GenericInvokePlugin[requests.RequestOauthRefreshCredentials, oauth_entities.OAuthRefreshCredentialsResult](
		session,
		req,
		1,
	)
}
