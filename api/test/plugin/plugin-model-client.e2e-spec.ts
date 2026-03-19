import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { PluginModelClientService } from '@/ai/plugin/services/plugin-model-client.service';

describe('PluginClientTest (e2e)', () => {
  jest.setTimeout(3000);
  let app: INestApplication<App>;
  let pluginModelClientService: PluginModelClientService;
  const testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    pluginModelClientService = app.get<PluginModelClientService>(PluginModelClientService);
  });

  describe('fetchModelProviders', () => {
    it('should fetch model providers', async () => {
      const providers = await pluginModelClientService.fetchModelProviders(testTenantId);
      expect(providers).toBeDefined();
      expect(providers.length).toBeGreaterThan(0);
      console.log('Fetched model providers:', providers);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
