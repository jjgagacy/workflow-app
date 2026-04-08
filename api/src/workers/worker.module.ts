import { AccountModule } from '@/account/account.module';
import { ModelRuntimeModule } from '@/ai/model_runtime/model_runtime.module';
import { BullConfig } from '@/config/bull.config';
import configuration from '@/config/configuration';
import { keyvConfig } from '@/config/keyv.config';
import { TypeOrmConfig } from '@/config/typeorm.config';
import { CoreModule } from '@/core/core.module';
import { EncryptionModule } from '@/encryption/encryption.module';
import { I18nGlobalModule } from '@/i18n-global/i18n-global.module';
import { LoggerModule } from '@/logger/logger.module';
import { MonieModule } from '@/monie/monie.module';
import { ServiceModule } from '@/service/service.module';
import { StorageModule } from '@/storage/storage.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { PingService } from './services/ping.service';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from '@/events/event.module';

@Module({
  imports: [
    CoreModule,
    ConfigModule.forRoot({
      envFilePath: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`),
      isGlobal: true,
      load: [configuration]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: TypeOrmConfig,
    }),
    HttpModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        timeout: Number(configService.get<number>('HTTP_TIMEOUT', 5000)),
        maxRedirects: Number(configService.get<number>('HTTP_MAX_REDIRECTS', 5)),
      }),
      inject: [ConfigService,]
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: true,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    EventModule,
    AccountModule,
    MonieModule,
    LoggerModule,
    I18nGlobalModule,
    ServiceModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: keyvConfig,
      inject: [ConfigService],
    }),
    EncryptionModule,
    StorageModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: BullConfig,
    }),
    ModelRuntimeModule,
  ],
  controllers: [

  ],
  providers: [
    ConfigService,
    PingService,
  ],
})
export class WorkerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}
