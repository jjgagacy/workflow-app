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

  // it('/ (create module)', async () => {
  //   const query = `
  //       mutation {
  //     		createModule(input: {key: "testmodule", name:"TestModule"}) {
  //       		id
  //         }
  //     }
  //   `;
  //   const response = await request(app.getHttpServer())
  //     .post('/graphql')
  //     .send({ query })
  //     .expect(200);

  //     expect(response.body.data.createModule.id).toBeDefined();
  // });
});
