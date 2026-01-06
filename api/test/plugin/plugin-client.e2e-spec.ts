import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { BasePluginClient } from '@/monie/classes/base-plugin-client';

describe('PluginClientTest (e2e)', () => {
    jest.setTimeout(10000);
    let app: INestApplication<App>;
    let basePluginClient: BasePluginClient;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        basePluginClient = app.get<BasePluginClient>(BasePluginClient);
    });
    describe('jsonRequest', () => {
        it('should make successful JSON GET request', (done) => {
            basePluginClient.jsonRequest({
                method: 'GET',
                path: '/api/data',
            }).subscribe({
                next: (data) => {
                    expect(data.status).toEqual("success");
                    expect(data.message).toEqual("Hello from Go Gin API");
                    done();
                },
                error: done.fail
            });
        });

        it('should make successful JSON POST request', (done) => {
            const requestData = { name: "alex", age: 17 };
            basePluginClient.jsonRequest({
                method: 'POST',
                path: '/api/echo',
                data: requestData,
            }).subscribe({
                next: (data) => {
                    expect(data.status).toEqual("success");
                    expect(data.message).toEqual("Data received successfully");
                    expect(data.received).toEqual(requestData);
                    done();
                },
                error: done.fail,
            })
        });
    });

    describe('streamRequest', () => {
        it('should handle stream data correctly', (done) => {
            const receivedData: string[] = [];

            basePluginClient.streamRequest({
                method: 'GET',
                path: '/sse/events',
            }).subscribe({
                next: (data) => {
                    receivedData.push(data);
                },
                complete: () => {
                    expect(JSON.parse(receivedData[0]).id).toEqual(1);
                    expect(JSON.parse(receivedData[1]).id).toEqual(2);
                    expect(receivedData[10]).toEqual("Stream completed");
                    done();
                },
                error: done.fail,
            });
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
