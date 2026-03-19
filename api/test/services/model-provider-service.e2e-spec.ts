import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { ModelProviderService } from '@/service/model-provider.service';

describe('ModelProviderService (e2e)', () => {
  let app: INestApplication<App>;
  let cacheService: EnhanceCacheService;
  let modelProviderService: ModelProviderService;
  let testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    modelProviderService = app.get<ModelProviderService>(ModelProviderService);
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

  afterAll(async () => {
    await app.close();
  });
});
