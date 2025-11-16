import { EnhanceCacheService } from "@/common/services/cache/enhance-cache.service";
import { Injectable } from "@nestjs/common";
import { CredentialsCacheOptions, CredentialsCacheType } from "../types/cache.type";
import { Credentials } from "../types/credentials.type";
import { GlobalLogger } from "@/logger/logger.service";

export interface ProviderCredentialsCacheProps {
  tenantId: string;
  identityId: string;
  cacheType: CredentialsCacheType;
}

@Injectable()
export class ProviderCredentialsCacheService {
  private readonly defaultTTL = 86400; // 24 hours

  constructor(
    private readonly cacheService: EnhanceCacheService,
    private readonly logger: GlobalLogger
  ) { }

  private getCacheKey(credentialsCacheProps: ProviderCredentialsCacheProps): string {
    const tenantId = credentialsCacheProps.tenantId;
    const identityId = credentialsCacheProps.identityId;
    const cacheType = credentialsCacheProps.cacheType;
    return `provider_credentials:tenant_id:${tenantId}:id:${identityId}:${cacheType}`;
  }

  async getCredentials(credentialsCacheProps: ProviderCredentialsCacheProps): Promise<Credentials | null> {
    const cacheKey = this.getCacheKey(
      credentialsCacheProps
    );

    try {
      const cachedProviderCredentials = await this.cacheService.get<Credentials>(cacheKey);
      return cachedProviderCredentials ?? null;
    } catch (error) {
      this.logger.error(`Failed to get cached credentials for key ${cacheKey}:`, error);
      return null;
    }
  }

  async setCredentials(
    credentialsCacheProps: ProviderCredentialsCacheProps,
    credentials: Credentials,
    options?: CredentialsCacheOptions
  ): Promise<void> {
    const cacheKey = this.getCacheKey(credentialsCacheProps);
    const ttl = options?.ttl || this.defaultTTL;

    try {
      await this.cacheService.set(cacheKey, credentials, ttl * 1000);
      this.logger.log(`Cached credentials for key ${cacheKey} with TTL ${ttl}s`);
    } catch (error) {
      this.logger.error(`Failed to cache credentials for key ${cacheKey}:`, error);
      throw new Error(`Failed to cache provider credentials: ${error.message}`);
    }
  }

  async delete(credentialsCacheProps: ProviderCredentialsCacheProps): Promise<void> {
    const cacheKey = this.getCacheKey(credentialsCacheProps);

    try {
      await this.cacheService.del(cacheKey);
      this.logger.log(`Deleted cached credentials for key ${cacheKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete cached credentials for key ${cacheKey}:`, error);
      throw new Error(`Failed to delete cached credentials: ${error.message}`);
    }
  }

  async exists(credentialsCacheProps: ProviderCredentialsCacheProps): Promise<boolean> {
    const cacheKey = this.getCacheKey(credentialsCacheProps);

    try {
      const exists = await this.cacheService.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence for key ${cacheKey}:`, error);
      return false;
    }
  }

  async refreshTTL(credentialsCacheProps: ProviderCredentialsCacheProps, ttl?: number): Promise<boolean> {
    const cacheKey = this.getCacheKey(credentialsCacheProps);
    const newTTL = ttl || this.defaultTTL;

    try {
      const expire = await this.cacheService.expire(cacheKey, newTTL);
      this.logger.debug(`Refreshed TTL for key ${cacheKey} to ${newTTL}s`);
      return expire === 1;
    } catch (error) {
      this.logger.error(`Failed to refresh TTL for key ${cacheKey}:`, error);
      throw new Error(`Failed to refresh TTL: ${error.message}`);
    }
  }
}

