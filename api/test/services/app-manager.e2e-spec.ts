import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { ProviderService } from '@/ai/model_runtime/services/provider.service';
import { AppManagerService } from '@/service/app-manager.service';
import { AccountService } from '@/account/account.service';
import { AppMode } from '@/ai/apps/types/app.type';
import { AppsService } from '@/ai/apps/apps.service';

describe('ProviderService (e2e)', () => {
  let app: INestApplication<App>;
  let cacheService: EnhanceCacheService;
  let appManagerService: AppManagerService;
  let accountService: AccountService;
  let appsService: AppsService;
  let testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';
  let accountId = 204;
  let testAppId = "fb9f6dc2-98c6-4066-aef7-d7939e0ea41d";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    appManagerService = app.get<AppManagerService>(AppManagerService);
    accountService = app.get<AccountService>(AccountService);
    appsService = app.get<AppsService>(AppsService);
    // 触发连接redis
    await cacheService.get('foo');
  });

  describe('getConfigurations', () => {
    // it('should create app', async () => {
    //   const accountEntity = await accountService.getById(accountId);
    //   const createAppInput = {
    //     name: 'Test App',
    //     mode: AppMode.CHAT,
    //     description: 'This is a test app',
    //     icon: "https://example.com/icon.png",
    //   };
    //   const app = await appManagerService.createApp(testTenantId, createAppInput, accountEntity!);
    //   expect(app).toBeDefined();
    //   console.log('Created app:', app);
    // });

    it('should update app', async () => {
      const accountEntity = await accountService.getById(accountId);
      const appEntity = await appsService.getById(testAppId);
      const updateAppInput = {
        description: 'This is an updated test app',
        icon: "https://example.com/updated-icon.png",
      };
      const app = await appManagerService.updateApp(appEntity!, updateAppInput, accountEntity!);
      expect(app).toBeDefined();
      console.log('Updated app:', app);
    });

    it('should list apps', async () => {
      const { data, total } = await appsService.query({
        tenantId: testTenantId,
        accountId,
      });
      expect(data).toBeDefined();
      expect(total).toBeGreaterThan(0);
      console.log('Queried apps:', data);
    });

    afterAll(async () => {
      await app.close();
    });
  });
});
