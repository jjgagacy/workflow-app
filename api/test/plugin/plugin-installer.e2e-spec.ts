import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { PluginInstallerService } from '@/ai/plugin/services/plugin-installer.service';
import { ProviderID } from '@/ai/plugin/entities/provider-id.entities';

describe('PluginInstaller (e2e)', () => {
  let app: INestApplication<App>;
  let pluginInstallerService: PluginInstallerService;
  let cacheService: EnhanceCacheService;
  const testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';
  const testPluginUniqueIdentifier = 'monie/hello:1.0.0';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    pluginInstallerService = app.get<PluginInstallerService>(PluginInstallerService);
    // 触发连接redis
    await cacheService.get('foo');
  });

  // describe('fetchPluginManifest', () => {
  //   it('should fetch the plugin manifest for a given tenant and plugin identifier', async () => {
  //     const manifest = await pluginInstallerService.fetchPluginManifest(testTenantId, testPluginUniqueIdentifier);
  //     expect(manifest).toBeDefined();
  //     console.log('Fetched plugin manifest:', manifest);
  //   });

  //   it('should throw an error for an invalid plugin identifier', async () => {
  //     await pluginInstallerService.fetchPluginManifest(testTenantId, 'invalid/identifier:1.0.0').catch((error) => {
  //       expect(error).toBeDefined();
  //       console.log('Error fetching plugin manifest with invalid identifier:', error.message);
  //     });
  //   });
  // });

  // describe('listPlugins', () => {
  //   it('should list all installed plugins for a given tenant', async () => {
  //     const plugins = await pluginInstallerService.listPlugins(testTenantId);
  //     expect(plugins).toBeDefined();
  //     console.log('List of installed plugins:', plugins);
  //     console.log(plugins.map(p => p.endpointsSetups));
  //   });
  // });

  // describe('fetchPluginInstallationByIds', () => {
  //   const pluginIds = ['monie/hello'];
  //   it('should fetch plugin installations by their unique identifiers', async () => {
  //     const installations = await pluginInstallerService.fetchPluginInstallationByPluginId(testTenantId, pluginIds);
  //     expect(installations).toBeDefined();
  //     console.log('Fetched plugin installations by IDs:', installations);
  //   });
  // });

  describe('checkToolExistence', () => {
    const toolIds = [new ProviderID('monie/hello/telegraph')];
    it('should check the existence of tools by their IDs', async () => {
      const existenceMap = await pluginInstallerService.checkToolExistence(testTenantId, toolIds);
      expect(existenceMap).toBeDefined();
      console.log('Tool existence map:', existenceMap);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
