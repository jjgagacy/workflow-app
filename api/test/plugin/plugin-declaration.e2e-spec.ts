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


describe('PluginDeclaration (e2e)', () => {
  let app: INestApplication<App>;
  let authAccountService: AuthAccountService;
  let tokenManagerService: TokenManagerService;
  let pluginDeclarationService: PluginDeclarationService;
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
    dataSource = app.get<DataSource>(DataSource);
    pluginDeclarationService = app.get<PluginDeclarationService>(PluginDeclarationService);
    // 触发连接redis
    await cacheService.get('foo');
  });

  describe('decodePluginPath', () => {

    it('should decode plugin declarations from a valid plugin path', async () => {
      const pluginPath = resolve(__dirname, '../../plugins-declaration');
      const pluginDeclarations = await pluginDeclarationService.decodePluginPath(pluginPath);
      expect(pluginDeclarations).toBeDefined();
      expect(pluginDeclarations.length).toBeGreaterThan(0);
      // Further assertions can be made based on the expected structure of the plugin declarations
    });

  });

  afterAll(async () => {
    await app.close();
  });
});
