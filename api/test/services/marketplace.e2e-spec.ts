import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { TokenManagerService } from '@/service/libs/token-manager.service';
import { DataSource } from 'typeorm';
import { AccountService } from '@/account/account.service';
import { TenantAccountEntity } from '@/account/entities/tenant-account.entity';
import { TenantEntity } from '@/account/entities/tenant.entity';
import { TenantStatus } from "@/service/types/tenant.type";
import { AccountEntity } from '@/account/entities/account.entity';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { PluginDeclarationService } from '@/service/plugin/plugin-declaration.service';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import { MarketplaceService } from '@/service/marketplace.service';


describe('Marketplace (e2e)', () => {
  let app: INestApplication<App>;
  let authAccountService: AuthAccountService;
  let tokenManagerService: TokenManagerService;
  let pluginDeclarationService: PluginDeclarationService;
  let marketplaceService: MarketplaceService;
  let dataSource: DataSource;
  let accountService: AccountService;
  let cacheService: EnhanceCacheService;
  const testEmail = '511268609@qq.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authAccountService = app.get<AuthAccountService>(AuthAccountService);
    tokenManagerService = app.get<TokenManagerService>(TokenManagerService);
    accountService = app.get<AccountService>(AccountService);
    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    marketplaceService = app.get<MarketplaceService>(MarketplaceService);
    dataSource = app.get<DataSource>(DataSource);
    pluginDeclarationService = app.get<PluginDeclarationService>(PluginDeclarationService);
    // 触发连接redis
    await cacheService.get('foo');
  });

  describe('getPluginDeclarations', () => {
    it('should get plugin declarations', async () => {
      const pluginDeclarations = await marketplaceService.getPluginDeclarationsUseCache();
      expect(pluginDeclarations).toBeDefined();
      expect(pluginDeclarations.length).toBeGreaterThan(0);
    });
  });

  describe('getModelProviderIcon', () => {
    it('should get openai icon', async () => {
      const iconData = await marketplaceService.getModelProviderIcon('openai', 'light');
      expect(iconData?.data).toBeDefined();
      expect(iconData?.mimeType).toBe('image/svg+xml');
    })
  });



  afterAll(async () => {
    await app.close();
  });
});
