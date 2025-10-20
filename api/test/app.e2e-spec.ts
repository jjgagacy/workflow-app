import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return hello world (en_US)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should return hello world (zh_Hans)', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Accept-Language', 'zh-Hans')
      .expect(200)
      .expect('你好 世界');
  });

  afterEach(async () => {
    // 关闭 NestJS 应用
    await app.close();
  });
});
