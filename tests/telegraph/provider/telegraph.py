from typing import Any

from dify_plugin import ToolProvider
from dify_plugin.errors.tool import ToolProviderCredentialValidationError


class TelegraphProvider(ToolProvider):
    
    def _validate_credentials(self, credentials: dict[str, Any]) -> None:
        """
        Verify that the provided Telegraph Access Token is valid.
        Attempt to create a test page using the token.
        If validation fails, a ToolProviderCredentialValidationError exception should be thrown.
        """
        access_token = credentials.get("telegraph_access_token")
        if not access_token:
            raise ToolProviderCredentialValidationError("Telegraph Access Token cannot be empty.")

        try:
            # Try to perform a simple operation requiring credentials to validate
            from ytelegraph import TelegraphAPI
            ph = TelegraphAPI(access_token=access_token)
            # Try to create a temporary, harmless page as a validation method
            # Note: A better validation method might be to call read-only methods like 'getAccountInfo' (if available)
            test_page = ph.create_page_md("Dify Validation Test", "This is a test page created by Dify plugin validation.")
            # If needed, consider immediately editing or deleting this test page, but this would add complexity
            # print(f"Validation successful. Test page created: {test_page}")
        except Exception as e:
            # If the API call fails, the credentials are likely invalid
            raise ToolProviderCredentialValidationError(f"Telegraph credential validation failed: {e}")

    #########################################################################################
    # If OAuth is supported, uncomment the following functions.
    # Warning: please make sure that the sdk version is 0.4.2 or higher.
    #########################################################################################
    # def _oauth_get_authorization_url(self, redirect_uri: str, system_credentials: Mapping[str, Any]) -> str:
    #     """
    #     Generate the authorization URL for telegraph OAuth.
    #     """
    #     try:
    #         """
    #         IMPLEMENT YOUR AUTHORIZATION URL GENERATION HERE
    #         """
    #     except Exception as e:
    #         raise ToolProviderOAuthError(str(e))
    #     return ""
        
    # def _oauth_get_credentials(
    #     self, redirect_uri: str, system_credentials: Mapping[str, Any], request: Request
    # ) -> Mapping[str, Any]:
    #     """
    #     Exchange code for access_token.
    #     """
    #     try:
    #         """
    #         IMPLEMENT YOUR CREDENTIALS EXCHANGE HERE
    #         """
    #     except Exception as e:
    #         raise ToolProviderOAuthError(str(e))
    #     return dict()

    # def _oauth_refresh_credentials(
    #     self, redirect_uri: str, system_credentials: Mapping[str, Any], credentials: Mapping[str, Any]
    # ) -> OAuthCredentials:
    #     """
    #     Refresh the credentials
    #     """
    #     return OAuthCredentials(credentials=credentials, expires_at=-1)
