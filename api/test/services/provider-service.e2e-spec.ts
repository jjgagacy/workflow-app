import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { ProviderService } from '@/ai/model_runtime/services/provider.service';

describe('ProviderService (e2e)', () => {
  let app: INestApplication<App>;
  let cacheService: EnhanceCacheService;
  let providerService: ProviderService;
  let testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    providerService = app.get<ProviderService>(ProviderService);
    // 触发连接redis
    await cacheService.get('foo');
  });

  describe('getConfigurations', () => {
    it('should get configurations', async () => {
      const configurations = await providerService.getConfigurations(testTenantId);
      expect(configurations).toBeDefined();
      console.log('Fetched provider configurations:', configurations);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
