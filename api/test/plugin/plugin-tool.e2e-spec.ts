import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { BasePluginClient } from '@/monie/classes/base-plugin-client';
import { PluginToolService } from '@/ai/plugin/services/tool.service';
import { CredentialType } from '@/ai/model_runtime/classes/plugin/oauth';
import { ToolInvokeMessage } from '@/ai/plugin/entities/tool.entities';

describe('PluginToolServiceTest (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication<App>;
  let basePluginClient: BasePluginClient;
  let pluginToolService: PluginToolService;
  const testTenantId = '272635fa-c96f-4ad4-b7c6-9406332ae89c';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    basePluginClient = app.get<BasePluginClient>(BasePluginClient);
    pluginToolService = app.get<PluginToolService>(PluginToolService);
  });

  describe('invokeTool', () => {
    it('should handle stream data correctly', (done) => {
      const receivedData: ToolInvokeMessage[] = [];

      pluginToolService.invoke({
        tenantId: testTenantId,
        userId: '',
        pluginId: 'monie/hello',
        toolProvider: 'telegraph',
        toolName: 'telegraph',
        credentials: {},
        credentialType: CredentialType.API_KEY,
        toolParameters: {
          title: "beijing",
          content: "beijing is the capital of china"
        },
      }).subscribe({
        next: (data) => {
          receivedData.push(data);
        },
        complete: () => {
          console.log('Received data:', receivedData);
          // expect(JSON.parse(receivedData[0]).id).toEqual(1);
          // expect(JSON.parse(receivedData[1]).id).toEqual(2);
          // expect(receivedData[10]).toEqual("Stream completed");
          done();
        },
        error: (err) => done(err),
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
