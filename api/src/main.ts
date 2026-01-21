import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join, resolve } from 'path';
import { TrimPipe } from './common/pipes/trim.pipe';
import { GlobalLogger } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { WinstonLogger } from './logger/winston.service';
import { MonieConfig } from './monie/monie.config';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { I18nService, I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { setModuleRef } from './common/modules/global';
import { ValidationPipe } from '@nestjs/common';
import { I18nHelperService } from './i18n-global/i18n.service';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  process.env.APP_ROOT = resolve(__dirname, '..');
  // create app
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new TrimPipe());
  /*
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    disableErrorMessages: false,
    validationError: {
      target: false,
      value: false,
    }
  }));
  */
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: true }));
  app.useGlobalFilters(new AllExceptionsFilter(app.get(GlobalLogger), app.get(I18nHelperService)));
  const logger = new WinstonLogger(app.get(ConfigService), app.get(MonieConfig));
  app.useLogger(
    new GlobalLogger(
      app.get(ConfigService),
      logger,
      app.get(MonieConfig),
      'MONIE',
    ),
  );
  // 启用 CORS
  app.enableCors({
    origin: true, // 或指定前端地址如 'http://localhost:3000'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // 如果需要发送 cookies/认证信息
  });
  // 配置上传目录
  const attachedDir = isProduction
    ? join(__dirname, '..', 'attached')
    : join(process.cwd(), 'attached');
  app.useStaticAssets(attachedDir, {
    prefix: '/attached',
    index: false,
  });
  // start app
  await app.listen(process.env.PORT ?? 3001);
  const appUrl = await app.getUrl();
  setModuleRef(app);

  // cli and npm levels
  // logger.error(`Application is running on: ${appUrl}`);
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
  // console log
  console.log(`Application is running on: ${appUrl}`);
}
bootstrap();
