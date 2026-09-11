import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { ModelProviderService } from '@/service/model-provider.service';
import { ProviderService } from '@/ai/model_runtime/services/provider.service';

describe('ModelProviderService (e2e)', () => {
  let app: INestApplication<App>;
  let cacheService: EnhanceCacheService;
  let modelProviderService: ModelProviderService;
  let providerService: ProviderService;
  let testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    modelProviderService = app.get<ModelProviderService>(ModelProviderService);
    providerService = app.get<ProviderService>(ProviderService);
    // 触发连接redis
    await cacheService.get('foo');
  });

  describe('getProviderList', () => {
    it('should get provider list', async () => {
      const providers = await modelProviderService.getProviderList(testTenantId);
      expect(providers).toBeDefined();
      console.log('Fetched provider list:', JSON.stringify(providers, null, 2));
    });
  });

  describe('getModelsByModelType', () => {
    it('should get models grouped by provider for a given modelType', async () => {
      const result = await modelProviderService.getModelsByModelType(testTenantId, 'llm');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      for (const providerModels of result) {
        expect(providerModels.providerName).toBeDefined();
        expect(providerModels.label).toBeDefined();
        expect(providerModels.models.length).toBeGreaterThan(0);
        for (const model of providerModels.models) {
          expect(model.modelType).toBe('llm');
        }
        console.log(`${providerModels.providerName} models:`, JSON.stringify(providerModels.models, null, 2));
      }
    });
  });

  describe('getProviderCredentials', () => {
    it('should get provider credentials', async () => {
      const result = await modelProviderService.getProviderCredentials(testTenantId, 'monie/hello/monie', false);
      expect(result).toBeDefined();
      const credentials = result.credentials;
      expect(credentials).toBeDefined();
      if (!credentials) {
        throw new Error('Provider credentials not found');
      }
      console.log('Fetched provider credentials:', JSON.stringify(credentials, null, 2));
      const decryptedCredentials = await providerService.decryptCredentialFields(testTenantId, credentials, ['openai_api_key']);
      console.log('Decrypted provider credentials:', JSON.stringify(decryptedCredentials, null, 2));
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
