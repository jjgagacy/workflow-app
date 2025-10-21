import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { GraphQLExceptionFilter } from '@/common/filters/graphql-exception.filter';
import { GlobalLogger } from '@/logger/logger.service';
import { BaseModulePermDto } from '@/account/perm/dto/base-module-perm.dto';
import { validate } from 'class-validator';

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

  afterEach(async () => {
    // 关闭 NestJS 应用
    await app.close();
  });
});
