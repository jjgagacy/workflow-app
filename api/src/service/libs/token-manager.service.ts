import { Injectable } from "@nestjs/common";
import { EnhanceCacheService } from "../../common/services/cache/enhance-cache.service";
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from "@nestjs/config";
import { DEFAULT_TOKEN_TYPE_EXPIRY } from "@/config/constants";

export interface TokenConfig {
  RESET_PASSWORD_TOKEN_EXPIRY_MINUTES: number;
  ACCOUNT_DELETION_TOKEN_EXPIRY_MINUTES: number;
  EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES: number;
  CHANGE_EMAIL_TOKEN_EXPIRY_MINUTES: number;
}

export const TOKEN_TYPES = {
  RESET_PASSWORD: 'reset_password',
  ACCOUNT_DELETION: 'account_deletion',
  EMAIL_VERIFICATION: 'email_verification',
  CHANGE_EMAIL: 'change_email',
  CONFIRM_EMAIL: 'confirm_email',
} as const;

type TokenTypeKey = keyof typeof TOKEN_TYPES;
export type TokenType = typeof TOKEN_TYPES[TokenTypeKey];

export interface TokenData {
  accountId?: number;
  email: string;
  tokenType: TokenType;
  [key: string]: any;
}

@Injectable()
export class TokenManagerService {
  constructor(
    private readonly cacheService: EnhanceCacheService,
    private readonly configService: ConfigService,
  ) { }

  async generateToken(
    tokenType: TokenType,
    account?: { id: number; email: string },
    email?: string,
    additionalData?: Record<string, any>,
  ): Promise<string> {
    if (!account && !email) {
      throw new Error('Account or email must be provided');
    }

    const accountId = account?.id;
    const accountEmail = account?.email || email || '';
    // if accountId provided, remove old token
    if (accountId) {
      const oldToken = await this.getTokenForAccount(accountId, tokenType);
      if (oldToken) {
        await this.removeToken(oldToken, tokenType);
      }
    }
    // create new token
    const token = uuidv4();
    const tokenData: TokenData = {
      accountId,
      email: accountEmail,
      tokenType,
      ...additionalData,
    };

    const expiryMinutes = this.getTokenExpiryMinutes(tokenType);
    if (expiryMinutes <= 1) {
      throw new Error(`Expiry minutes for ${tokenType} token is valid`);
    }
    const tokenKey = this.getTokenKey(token, tokenType);
    const expiryTime = expiryMinutes * 60; // transfer to second

    await this.cacheService.set(tokenKey, tokenData, expiryTime * 1000);
    // if accountId provided, set new token
    if (accountId) {
      await this.setTokenForAccount(accountId, token, tokenType, expiryMinutes);
    }
    return token;
  }

  private async getTokenForAccount(accountId: number, tokenType: TokenType): Promise<string | undefined> {
    const key = this.getAccountTokenKey(accountId, tokenType);
    return await this.cacheService.get<string>(key);
  }

  private async setTokenForAccount(accountId: number, token: string, tokenType: TokenType, expiryMinutes: number): Promise<void> {
    const key = this.getAccountTokenKey(accountId, tokenType);
    const expireTime = expiryMinutes * 60 * 1000;
    await this.cacheService.set(key, token, expireTime);
  }

  async removeToken(token: string, tokenType: TokenType): Promise<void> {
    const tokenKey = this.getTokenKey(token, tokenType);
    await this.cacheService.del(tokenKey);
  }

  private getAccountTokenKey(accountId: number, tokenType: TokenType): string {
    return `token_manager:${tokenType}:account:${accountId}`;
  }

  private getTokenKey(token: string, tokenType: TokenType): string {
    return `token_manager:${tokenType}:token:${token}`;
  }

  private getTokenExpiryMinutes(tokenType: TokenType): number {
    const configKey = `${tokenType.toUpperCase()}_TOKEN_EXPIRY_MINUTES`;
    return this.configService.get<number>(configKey, DEFAULT_TOKEN_TYPE_EXPIRY[tokenType]);
  }

  async getTokenData(token: string, tokenType: TokenType): Promise<TokenData | null> {
    const key = this.getTokenKey(token, tokenType);

    try {
      const tokenData = await this.cacheService.get<TokenData>(key);
      if (!tokenData) {
        return null;
      }
      return tokenData;
    } catch (error) {
      return null;
    }
  }

  async validateToken(token: string, tokenType: TokenType): Promise<TokenData | null> {
    const tokenData = await this.getTokenData(token, tokenType);
    if (!tokenData) {
      return null;
    }

    // todo: other validation
    return tokenData;
  }

  async removeTokensForAccount(accountId: number, tokenType?: TokenType): Promise<void> {
    if (tokenType) {
      const token = await this.getTokenForAccount(accountId, tokenType);
      if (token) {
        await this.removeToken(token, tokenType);
      }
      const key = this.getAccountTokenKey(accountId, tokenType);
      await this.cacheService.del(key);
    } else {
      const tokenTypes = Object.values(TOKEN_TYPES);
      for (const tokenType of tokenTypes) {
        const token = await this.getTokenForAccount(accountId, tokenType);
        if (token) {
          await this.removeToken(token, tokenType);
        }
        const key = this.getAccountTokenKey(accountId, tokenType);
        await this.cacheService.del(key);
      }
    }
  }
}
