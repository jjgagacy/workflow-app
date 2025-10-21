import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/common/filters/graphql-exception.filter';
import { GlobalLogger } from '@/logger/logger.service';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('UpdateAccount Mutation (e2e)', () => {
    let app: INestApplication<App>;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new GraphQLExceptionFilter(app.get(GlobalLogger)));
        app.useGlobalPipes(new I18nValidationPipe());
        app.useGlobalFilters(new I18nValidationExceptionFilter());
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

    it('should update account successfully with valid input', async () => {
        const updateAccountMutation = `
            mutation UpdateAccount($input: AccountInput!) {
                updateAccount(input: $input) {
                    id
                }
            }
        `;

        const variables = {
            input: {
                id: 1, // 假设存在的账户 ID
                email: 'jjgagacy@163.com',
                mobile: '18700000000',
                status: 0,
                roles: [1],
            }
        }

        const response = await request(app.getHttpServer())
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Accept-Language', 'zh-Hans')
            .send({ query: updateAccountMutation, variables });
        if (response.body.errors) {
            console.error('Update Account Errors:', response.body.errors);
        }
        expect(response.status).toBe(200);
        expect(response.body.data.updateAccount).toBeDefined();
        expect(response.body.data.updateAccount.id).toBeGreaterThan(0);
    });

    afterAll(async () => {
        // 关闭 NestJS 应用
        await app.close();
    });
});
