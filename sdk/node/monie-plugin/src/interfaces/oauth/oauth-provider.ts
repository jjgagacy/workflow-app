import { ClassWithMarker } from "../marker.class";

export const OAUTH_PROVIDER = Symbol.for('plugin.oauth.provider');

export abstract class OAuthProvider {
  static [OAUTH_PROVIDER] = true;

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

export type OauthProviderClassType = ClassWithMarker<OAuthProvider, typeof OAUTH_PROVIDER>;
export function isOauthProviderClass(cls: any): cls is OauthProviderClassType {
  return Boolean(cls?.[OAUTH_PROVIDER]);
}