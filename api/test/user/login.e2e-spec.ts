import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/common/filters/graphql-exception.filter';
import { GlobalLogger } from '@/logger/logger.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GraphQLExceptionFilter(app.get(GlobalLogger)));
    await app.init();
  });

  it('/ (test)', async () => {

  });

  it('/ (account auth)', async () => {
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

    // 打印完整响应（调试用）
    // console.log('statusCode', response.status);
    // console.log(JSON.stringify(response.body, null, 2));

    if (response.body.errors) {
      console.error('GraphQL Errors:', response.body.errors);
    }

    expect(response.status).toBe(200);
    expect(response.body.data.login).toHaveProperty('access_token');
  });

  afterEach(async () => {
    // 关闭 NestJS 应用
    await app.close();
  });
});
