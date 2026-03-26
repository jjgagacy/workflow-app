import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { PluginModelProvider } from '@/ai/model_runtime/classes/plugin/model-provider';
import { ProviderManager } from '@/ai/model_runtime/services/provider-manager';

describe('ModelProviderPlugin (e2e)', () => {
  // jest.setTimeout(30000);
  let app: INestApplication<App>;
  let modelProviderPlugin: PluginModelProvider;
  let providerManager: ProviderManager;
  let connected = false;
  const testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    modelProviderPlugin = app.get<PluginModelProvider>(PluginModelProvider);
    providerManager = app.get<ProviderManager>(ProviderManager);
    // trigger connect redis because lazy connect
    connected = true;
  });

  it('should initialize ok', async () => {
    expect(modelProviderPlugin).toBeDefined();
  });

  it('test encrypt and decrypt token', async () => {
    const encrypted = await providerManager.encryptToken(testTenantId, 'my-secret-token');
    expect(encrypted).toBeDefined();
    const decrypted = await providerManager.decryptToken(testTenantId, encrypted);
    expect(decrypted).toBe('my-secret-token');
  });

  afterAll(async () => {
    await app.close();
  });
});
