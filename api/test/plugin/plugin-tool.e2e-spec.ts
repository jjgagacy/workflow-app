import { describe, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { BasePluginClient } from '@/monie/classes/base-plugin-client';
import { PluginToolService } from '@/ai/plugin/services/tool.service';
import { CredentialType } from '@/ai/model_runtime/classes/plugin/oauth';
import { ToolInvokeMessage } from '@/ai/plugin/entities/tool.entities';
import { lastValueFrom, toArray } from 'rxjs';

describe('PluginToolServiceTest (e2e)', () => {
  jest.setTimeout(60000);
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
    // it('should handle stream data correctly', (done) => {
    //   const receivedData: ToolInvokeMessage[] = [];

    //   pluginToolService.invoke({
    //     tenantId: testTenantId,
    //     userId: '',
    //     pluginId: 'monie/hello',
    //     toolProvider: 'telegraph',
    //     toolName: 'telegraph',
    //     credentials: {},
    //     credentialType: CredentialType.API_KEY,
    //     toolParameters: {
    //       title: "beijing",
    //       content: "beijing is the capital of china"
    //     },
    //   }).subscribe({
    //     next: (data) => {
    //       receivedData.push(data);
    //     },
    //     complete: () => {
    //       console.log('Received data:', receivedData);
    //       // expect(JSON.parse(receivedData[0]).id).toEqual(1);
    //       // expect(JSON.parse(receivedData[1]).id).toEqual(2);
    //       // expect(receivedData[10]).toEqual("Stream completed");
    //       done();
    //     },
    //     error: (err) => done(err),
    //   });
    // });

    // it('should handle concurrent invocations correctly', async () => {
    //   const concurrentCount = 5;
    //   const requests: Promise<{ requestId: number; title: string; messages: ToolInvokeMessage[]; }>[] = []; // Add type annotation

    //   const testCases = [
    //     { title: "Beijing", content: "Beijing is the capital of China", id: 1 },
    //     { title: "Shanghai", content: "Shanghai is the largest city", id: 22 },
    //     { title: "Guangzhou", content: "Guangzhou is in Guangdong", id: 333 },
    //     { title: "Shenzhen", content: "Shenzhen is a tech hub", id: 4444 },
    //     { title: "Hangzhou", content: "Hangzhou is famous for West Lake", id: 55555 },
    //   ];

    //   for (let i = 0; i < concurrentCount; i++) {
    //     const testCase = testCases[i % testCases.length];
    //     const request = invokeAndCollect({
    //       tenantId: testTenantId,
    //       userId: `user_${testCase.id}`,
    //       pluginId: 'monie/hello',
    //       toolProvider: 'telegraph',
    //       toolName: 'telegraph',
    //       credentials: {},
    //       credentialType: CredentialType.API_KEY,
    //       toolParameters: {
    //         title: testCase.title,
    //         content: testCase.content,
    //         requestId: testCase.id, // 添加唯一标识
    //       },
    //     }).then(messages => ({
    //       requestId: testCase.id,
    //       title: testCase.title,
    //       messages,
    //     }));

    //     requests.push(request);
    //   }

    //   const results = await Promise.all(requests);
    //   expect(results).toHaveLength(concurrentCount);

    //   results.forEach(({ requestId, title, messages }) => {
    //     console.log(`Request ${requestId} (${title}) received ${messages.length} messages.`);
    //     expect(messages.length).toBeGreaterThan(0);
    //     expect(JSON.stringify(messages[0].message)).toContain(title);
    //   });

    //   // 验证所有请求的响应都是独立的，没有互相干扰
    //   // 通过检查每个请求的数据唯一性
    //   const allMessageIds = results.flatMap(r =>
    //     r.messages.map(m => `${r.requestId}_${JSON.stringify(m).length}`)
    //   );
    //   const uniqueIds = new Set(allMessageIds);
    //   expect(uniqueIds.size).toBe(allMessageIds.length);
    // });

    // 压力测试：高并发请求
    // it('should handle high concurrent load', async () => {
    //   const highConcurrentCount = 20;
    //   const startTime = Date.now();

    //   const promises: Promise<{ index: number; messageCount: number; messages: ToolInvokeMessage[]; }>[] = [];
    //   for (let i = 0; i < highConcurrentCount; i++) {
    //     const promise = invokeAndCollect({
    //       tenantId: testTenantId,
    //       userId: `user_${i}`,
    //       pluginId: 'monie/hello',
    //       toolProvider: 'telegraph',
    //       toolName: 'telegraph',
    //       credentials: {},
    //       credentialType: CredentialType.API_KEY,
    //       toolParameters: {
    //         title: `Test ${i}`,
    //         content: `Content for test ${i} with unique identifier ${i}`,
    //         requestIndex: i,
    //       },
    //     }).then(messages => ({
    //       index: i,
    //       messageCount: messages.length,
    //       messages,
    //     }));

    //     promises.push(promise);
    //   }

    //   const results = await Promise.all(promises);
    //   const duration = Date.now() - startTime;

    //   console.log(`High concurrent test completed: ${highConcurrentCount} requests in ${duration}ms`);

    //   // 验证所有请求都成功完成
    //   expect(results).toHaveLength(highConcurrentCount);

    //   // 验证每个请求都收到了数据
    //   results.forEach(result => {
    //     expect(result.messageCount).toBeGreaterThan(0);
    //   });

    //   // 验证没有请求失败
    //   const failedRequests = results.filter(r => r.messageCount === 0);
    //   expect(failedRequests).toHaveLength(0);
    // });

    // 顺序执行测试：验证多次调用的隔离性
    // it('should maintain isolation between sequential requests', async () => {
    //   const requestCount = 3;
    //   const results: { sequence: number; messageCount: number; messages: ToolInvokeMessage[]; }[] = [];

    //   for (let i = 0; i < requestCount; i++) {
    //     const result = await invokeAndCollect({
    //       tenantId: testTenantId,
    //       userId: `sequential_user_${i}`,
    //       pluginId: 'monie/hello',
    //       toolProvider: 'telegraph',
    //       toolName: 'telegraph',
    //       credentials: {},
    //       credentialType: CredentialType.API_KEY,
    //       toolParameters: {
    //         title: `Sequential Test ${i}`,
    //         content: `Sequential content ${i}`,
    //         sequence: i,
    //       },
    //     });

    //     results.push({
    //       sequence: i,
    //       messageCount: result.length,
    //       messages: result,
    //     });
    //   }

    //   // 验证每次请求都成功
    //   expect(results).toHaveLength(requestCount);
    //   results.forEach(result => {
    //     expect(result.messageCount).toBeGreaterThan(0);
    //   });

    //   // 验证请求之间的数据是独立的
    //   const allMessages = results.flatMap(r => r.messages);
    //   const uniqueMessageSignatures = new Set(
    //     allMessages.map(m => JSON.stringify(m).substring(0, 100))
    //   );

    //   // 由于内容不同，应该有足够的唯一性
    //   expect(uniqueMessageSignatures.size).toBeGreaterThan(1);
    // });

    // 并发错误处理测试
    it('should handle concurrent requests with some failures gracefully', async () => {
      const concurrentCount = 5;
      const requests: Promise<{ index: number; success: boolean; messageCount?: number; error?: string; }>[] = [];

      for (let i = 0; i < concurrentCount; i++) {
        // 为最后一个请求使用无效参数来模拟失败
        const isValid = i < concurrentCount - 1;
        console.log(`Invoking request ${i} with ${isValid ? 'valid' : 'invalid'} parameters`);
        const request = invokeAndCollect({
          tenantId: testTenantId,
          userId: `user_${i}`,
          pluginId: 'monie/hello',
          toolProvider: 'telegraph',
          toolName: 'telegraph',
          credentials: {},
          credentialType: CredentialType.API_KEY,
          toolParameters: isValid ? {
            title: `Test ${i}`,
            content: `Content ${i}`,
          } : {
            title: "",
            content: "",
          },
        }).then(messages => ({
          index: i,
          success: true,
          messageCount: messages.length,
        })).catch(error => ({
          index: i,
          success: false,
          error: error.message,
        }));

        requests.push(request);
      }

      const results = await Promise.all(requests);

      // 验证成功和失败的请求都正确处理
      const successfulRequests = results.filter(r => r.success);
      const failedRequests = results.filter(r => !r.success);

      expect(successfulRequests.length).toBeGreaterThan(0);
      console.log(`Successful: ${successfulRequests.length}, Failed: ${failedRequests.length}`);

      // 验证成功的请求都收到了数据
      successfulRequests.forEach(r => {
        expect(r.messageCount).toBeGreaterThan(0);
      });
    });
  });

  async function invokeAndCollect(params: any): Promise<ToolInvokeMessage[]> {
    const observable = pluginToolService.invoke(params);
    return await lastValueFrom(observable.pipe(toArray()));
  }

  afterAll(async () => {
    await app.close();
  });
});
