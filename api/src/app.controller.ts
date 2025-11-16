import { BadRequestException, Controller, Get, Headers, HttpException, HttpStatus, Inject, Res, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { MonieConfig } from './monie/monie.config';
import { GlobalLogger, LogLevels } from './logger/logger.service';
import { WinstonLogger } from './logger/winston.service';
import { I18n, I18nContext, I18nService, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { I18nTranslations } from './generated/i18n.generated';
import { UpdateAccountDto } from './account/account/dto/update-account.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AuthAccountService } from './service/auth-account.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EnhanceCacheService } from './common/services/cache/enhance-cache.service';
import { GeneralCacheService } from './common/services/cache/general-cache.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { LocalFileStorage } from './storage/implements/local-file.storage';
import { StorageService } from './storage/storage.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailService } from './mail/mail.service';
import { EmailLanguage } from './mail/mail-i18n.service';
import { LocationService } from './service/libs/location.service';
import { DeviceService } from './service/libs/device.service';
import { Response } from 'express';

class OrderCreatedEvent {
  constructor(private eventObj: { orderId: number; payload: any }) { }
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly monieConfig: MonieConfig,
    private readonly logger: GlobalLogger,
    private readonly winstonLogger: WinstonLogger,
    private readonly i18n: I18nService,
    private readonly authAccountService: AuthAccountService,
    private readonly cacheService: EnhanceCacheService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly generalCache: GeneralCacheService,
    private readonly eventEmitter: EventEmitter2,
    private readonly localFileStorage: LocalFileStorage,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
    private readonly locationService: LocationService,
    private readonly deviceService: DeviceService,
  ) { }

  @Get()
  async getHello(@Headers('user-agent') userAgent: string) {
    // console.log(this.monieConfig.redisHost())
    // this.logger.error("123");
    // this.winstonLogger.info('abc', { id: 1, name: 'foo' });
    // return this.appService.getHello();
    // console.log(this.i18nService.translate('validation.NOT_EMPTY'));
    // const dto: UpdateAccountDto = { updatedBy: "" };
    // const validateObj = plainToInstance(UpdateAccountDto, dto);
    // const errors = await this.i18nService.validate(validateObj);
    // console.log(errors)
    // this.authAccountService.test();
    // await this.cacheManager.set('key', 'value', 15000);
    // const value = await this.cacheManager.get<string>('key');
    // console.log('cahce value:', value);
    // console.log('cahce value:', await this.cacheManager.get('foo'));
    // console.log(this.cacheManager.stores);
    // const redisClient = await this.cacheService.getRedisClient();
    // console.log('client', redisClient)
    // console.log(await this.generalCache.findAll());
    // console.log(await GeneralCacheService.findItem());
    // this.eventEmitter.emit('order.created', new OrderCreatedEvent({
    //   orderId: 1,
    //   payload: {},
    // }));
    // await this.storageService.save('hello.txt', 'hello world');
    // await this.mailService.Template.sendWelcome('jjgagacy@163.com', { name: 'alex', url: 'http://ai.monie.cc' });
    // const job = this.mailService.queue.sendWelcome('jjgagacy@163.com', { name: 'alex', url: 'http://ai.monie.cc' })
    // await this.mailService.queue.sendInviteNumber({
    //   to: 'jjgagacy@163.com',
    //   inviterName: 'Monie',
    //   workspaceName: 'Sandbox',
    //   invitationUrl: 'http://ai.monie.cc/',
    //   expiryHours: 24,
    //   language: EmailLanguage.ZH_HANS,
    // });
    // await this.cacheService.set('foo', 'bar', 5000);
    // await this.locationService.getLocationFromIp('113.108.81.189');
    const deviceInfo = this.deviceService.getDeviceInfo(userAgent);
    console.log(deviceInfo);
    return await this.i18n.t("hello.HELLO");
  }

  @OnEvent('order.created')
  handleOrderCreatedEvent(payload: OrderCreatedEvent) {
    // handle and process "OrderCreatedEvent" event
    console.log('event handle', payload);
  }

  @Get('/favicon.ico')
  getFavicon(@Res() res: Response) {
    return res.sendStatus(204); // 返回 204 No Content
  }
}
