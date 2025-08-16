import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (test)', async () => {

  });

  it('/ (account auth)', async () => {
    const query = `
        mutation {
      		login(input: {username: "alex", password:"123456"}) {
        		access_token
          }
      }
    `;
      const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query });

      // 打印完整响应（调试用）
    //   console.log(JSON.stringify(response.body, null, 2));

      if (response.body.errors) {
          console.error('GraphQL Errors:', response.body.errors);
        //   throw new Error(JSON.stringify(response.body.errors));
      }

      expect(response.status).toBe(200);
      expect(response.body.data.login).toHaveProperty('access_token');
  });
});
