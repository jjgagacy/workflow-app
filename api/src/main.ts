import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolve } from 'path';
import { TrimPipe } from './common/pipes/trim.pipe';
import { BadExceptionFilter } from './common/filters/bad-exception.filter';
import { GlobalLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { WinstonLogger } from './logger/winston.service';

async function bootstrap() {
  process.env.APP_ROOT = resolve(__dirname, '..');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new TrimPipe());
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new BadExceptionFilter(httpAdapter));
  const configService = app.get(ConfigService);
  const logger = new WinstonLogger(configService);
  app.useLogger(new GlobalLogger(configService, logger, 'MONIE'))
  // 启用 CORS
  app.enableCors({
    origin: true, // 或指定前端地址如 'http://localhost:3000'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // 如果需要发送 cookies/认证信息
  });
  await app.listen(process.env.PORT ?? 3001);
  const appUrl = await app.getUrl();
  // cli and npm levels
  logger.error(`Application is running on: ${appUrl}`);
  logger.warn(`Application is running on: ${appUrl}`);
  logger.info(`Application is running on: ${appUrl}`, { foo: 'bar' });
  logger.debug(`Application is running on: ${appUrl}`);
  logger.http(`Application is running on: ${appUrl}`);
  logger.verbose(`Application is running on: ${appUrl}`);
  logger.input(`Application is running on: ${appUrl}`);
  logger.silly(`Application is running on: ${appUrl}`);
  logger.data(`Application is running on: ${appUrl}`);
  logger.help(`Application is running on: ${appUrl}`);
  logger.prompt(`Application is running on: ${appUrl}`);
  // syslog level
  logger.emerg(`Application is running on: ${appUrl}`);
  logger.alert(`Application is running on: ${appUrl}`);
  logger.crit(`Application is running on: ${appUrl}`);
  logger.notice(`Application is running on: ${appUrl}`);
}
bootstrap();
