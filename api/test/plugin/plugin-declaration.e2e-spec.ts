import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { PluginDeclarationService } from '@/service/plugin/plugin-declaration.service';
import { resolve } from 'path';

describe('PluginDeclaration (e2e)', () => {
  let app: INestApplication<App>;
  let pluginDeclarationService: PluginDeclarationService;
  let cacheService: EnhanceCacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
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
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
