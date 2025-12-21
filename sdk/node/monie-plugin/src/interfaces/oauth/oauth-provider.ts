export abstract class OAuthProvider {
  oauthGetAuthorizationurl(redirectUri: string, systemCredentials?: Record<string, any>): string {
    throw new Error(`Not impl`);
  }

  oauthGetCredentials(redirectUri: string, systemCredentials: Record<string, any>, request: any): Promise<{
    metadata?: Record<string, any>;
    credentials: Record<string, any>;
    expiresAt?: string | number;
  }> {
    throw new Error(`Not impl`);
  }

  oauthRefreshCredentials(redirectUri: string, systemCredentials: Record<string, any>, credentials: Record<string, any>):
    Promise<{
      credentials: Record<string, any>;
      expiresAt?: string | number;
    }> {
    throw new Error(`Not impl`);
  }
}
