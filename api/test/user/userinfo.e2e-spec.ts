import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/common/filters/graphql-exception.filter';
import { GlobalLogger } from '@/logger/logger.service';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('UserInfo (e2e)', () => {
    let app: INestApplication<App>;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new GraphQLExceptionFilter(app.get(GlobalLogger)));
        await app.init();
    });

    const login = async (): Promise<string> => {
        const query = `
            mutation {
                login(input: {username: "admin", password:"abc12345"}) {
                    access_token
            }
        }
        `;
        const response = await request(app.getHttpServer())
            .post('/graphql')
            .send({ query });

        if (response.body.errors) {
            console.error('GraphQL Errors:', response.body.errors);
            throw new Error('Login failed');
        }

        return response.body.data.login.access_token;
    }

    beforeEach(async () => {
        // 在每个测试前获取新的 token
        accessToken = await login();
    });

    it('should get current user', async () => {
        const query = `
                query {
                    currentUser {
                        id,
                        name
                    }
                }
            `;

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ query });

        expect(response.status).toBe(200);
        expect(response.body.data.currentUser.name).toBe('admin');
    });

    // it('should get current user fail', async () => {
    //     const query = `
    //             query {
    //                 currentUser {
    //                     id,
    //                     name
    //                 }
    //             }
    //         `;

    //     await delay(4000); // 等待4秒，确保token过期（假设token有效期为3秒）

    //     const response = await request(app.getHttpServer())
    //         .post('/graphql')
    //         .set('Authorization', `Bearer ${accessToken}`)
    //         .send({ query });

    //     console.log(response.body);
    //     expect(response.status).toBe(200);
    // });

    afterAll(async () => {
        // 关闭 NestJS 应用
        await app.close();
    });
});
