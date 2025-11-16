import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { ProviderCredentialsCacheProps, ProviderCredentialsCacheService } from '@/ai/model_runtime/services/provider-credentials-cache.service';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { CredentialsCacheOptions, CredentialsCacheType } from '@/ai/model_runtime/types/cache.type';
import { Credentials } from '@/ai/model_runtime/types/credentials.type';
import { TenantNotFoundError } from '@/service/exceptions/tenant.error';

describe('ProviderCredentialsCacheServiceTest (e2e)', () => {
  jest.setTimeout(10000);
  let app: INestApplication<App>;
  let credentialsCacheService: ProviderCredentialsCacheService;
  let cacheService: EnhanceCacheService;
  let connected = false;
  const testTenantId = '106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a';
  const testProviderId = '106bd7b2-29d5-4b7e-bc2c-0dc14b2239k9';
  let testCredentialCacheProps: ProviderCredentialsCacheProps;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    credentialsCacheService = app.get<ProviderCredentialsCacheService>(ProviderCredentialsCacheService);
    // trigger connect redis because lazy connect
    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    cacheService.get('foo');
    connected = true;

    testCredentialCacheProps = {
      tenantId: testTenantId,
      identityId: testProviderId,
      cacheType: CredentialsCacheType.PROVIDER,
    } as ProviderCredentialsCacheProps;
  });

  beforeEach(() => {
    credentialsCacheService.delete(testCredentialCacheProps);
  });

  describe('Provider Credentials Cache Operations', () => {
    it('should set and get provider credentials successfully', async () => {
      const testCredentials = {
        apiKey: 'sk-test-key-123',
        baseUrl: 'https://api.test.com/v1',
        organizationId: 'test-org',
      } as Credentials;

      await credentialsCacheService.setCredentials(testCredentialCacheProps, testCredentials, { ttl: 60 });

      const cacheType = CredentialsCacheType.PROVIDER;
      const cachedData = await cacheService.get<Credentials>(`provider_credentials:tenant_id:${testTenantId}:id:${testProviderId}:${cacheType}`);
      expect(cachedData).toBeDefined();
      expect(cachedData).toEqual(testCredentials);

      const retrievedCredentials = await credentialsCacheService.getCredentials(testCredentialCacheProps);
      expect(retrievedCredentials).toEqual(testCredentials);
    });

    it('should return null for non-existent cache', async () => {
      const prop = {
        tenantId: testTenantId,
        identityId: '1',
        cacheType: CredentialsCacheType.PROVIDER,
      } as ProviderCredentialsCacheProps;
      const result = await credentialsCacheService.getCredentials(prop);
      expect(result).toBeNull();
    });

    it('should delete cached credentials successfully', async () => {
      const testCredentials = {
        apiKey: 'sk-test-key-123',
      } as Credentials;

      await credentialsCacheService.setCredentials(testCredentialCacheProps, testCredentials, { ttl: 60 });

      let exists = await credentialsCacheService.exists(testCredentialCacheProps);
      expect(exists).toBe(true);

      await credentialsCacheService.delete(testCredentialCacheProps);

      exists = await credentialsCacheService.exists(testCredentialCacheProps);
      expect(exists).toBe(false);

      const result = await credentialsCacheService.getCredentials(testCredentialCacheProps);
      expect(result).toBeNull();
    });

    it('should handle different cache types correctly', async () => {
      const testModelId = 'test-model-123';
      const modelCredentials = {
        model_key: "model-key-123",
        temperature: 0.7,
        max_tokens: 1000,
      };
      const testModelProps = {
        tenantId: testTenantId,
        identityId: testModelId,
        cacheType: CredentialsCacheType.MODEL,
      } as ProviderCredentialsCacheProps;
      await credentialsCacheService.setCredentials(testModelProps, modelCredentials, { ttl: 600 });

      const retrievedModelCredentials = await credentialsCacheService.getCredentials(testModelProps);
      expect(retrievedModelCredentials).toEqual(modelCredentials);

      const providerCredentials = {
        endpoints: [
          { url: 'https://lb1.test.com', weight: 60 },
          { url: 'https://lb2.test.com', weight: 40 },
        ],
        strategy: 'weighted-round-robin',
      };
      const providerProps = {
        tenantId: testTenantId,
        identityId: '123',
        cacheType: CredentialsCacheType.PROVIDER,
      } as ProviderCredentialsCacheProps;
      await credentialsCacheService.setCredentials(providerProps, providerCredentials);

      const modelKeyExists = await cacheService.exists(`provider_credentials:tenant_id:${testTenantId}:id:${testModelId}:${CredentialsCacheType.MODEL}`);
      const providerKeyExists = await credentialsCacheService.exists(providerProps);

      expect(modelKeyExists).toBe(1);
      expect(providerKeyExists).toBeTruthy();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent read/write operations', async () => {
      const concurrentTestId = 'concurrent-test';
      const providerProps = {
        tenantId: testTenantId,
        identityId: concurrentTestId,
        cacheType: CredentialsCacheType.PROVIDER,
      } as ProviderCredentialsCacheProps;

      const concurrentOperations = Array.from({ length: 10 }, (_, i) => {
        credentialsCacheService.setCredentials(providerProps, { apiKey: `concurrent-key-${i}`, index: i });
      });

      await Promise.all(concurrentOperations);

      const finalValue = await credentialsCacheService.getCredentials(providerProps);
      expect(finalValue).toBeDefined();
      expect(finalValue).toHaveProperty('apiKey');
      expect(finalValue).toHaveProperty('index');
    });
  });

  describe('Data Integrity', () => {
    it('should remain data integrity across multiple operations', async () => {
      const integrityTestId = 'integrity-test';
      const providerProps = {
        tenantId: testTenantId,
        identityId: integrityTestId,
        cacheType: CredentialsCacheType.PROVIDER,
      } as ProviderCredentialsCacheProps;

      const complexCredentials = {
        api_key: 'complex-key-123',
        config: {
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1.0,
        },
        endpoints: [
          { url: 'https://api1.test.com', priority: 1 },
          { url: 'https://api2.test.com', priority: 2 },
        ],
        metadata: {
          created_at: new Date().toISOString(),
          version: '1.0.0',
        },
      } as Credentials;

      await credentialsCacheService.setCredentials(providerProps, complexCredentials);

      const read1 = await credentialsCacheService.getCredentials(providerProps);
      const read2 = await credentialsCacheService.getCredentials(providerProps);
      const read3 = await credentialsCacheService.getCredentials(providerProps);

      expect(read1).toEqual(complexCredentials);
      expect(read2).toEqual(complexCredentials);
      expect(read3).toEqual(complexCredentials);
      expect(read1).toEqual(read2);
      expect(read2).toEqual(read3);

      const updatedCredentials = {
        ...complexCredentials,
        config: { ...complexCredentials.config, temperature: 0.8 },
      };
      await credentialsCacheService.setCredentials(providerProps, updatedCredentials);

      const finalRead = await credentialsCacheService.getCredentials(providerProps);
      expect(finalRead).toEqual(updatedCredentials);
      expect(finalRead?.config?.temperature).toBe(0.8);
    });
  });

  afterAll(async () => {
    const keys = await cacheService.keys('provider_credentials:tenant_id:106bd7b2-29d5*');
    if (keys.length > 0) {
      keys.forEach(async (key: string) => {
        await cacheService.del(key);
      });
    }
    await app.close();
  });
});
