import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolve } from 'path';
import { TrimPipe } from './common/pipes/trim.pipe';
import { BadExceptionFilter } from './common/filters/bad-exception.filter';
import { GlobalLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  process.env.APP_ROOT = resolve(__dirname, '..');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new TrimPipe());
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new BadExceptionFilter(httpAdapter));
  const configService = app.get(ConfigService);
  app.useLogger(new GlobalLogger(configService, 'APP'))
  // 启用 CORS
  app.enableCors({
    origin: true, // 或指定前端地址如 'http://localhost:3000'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // 如果需要发送 cookies/认证信息
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
