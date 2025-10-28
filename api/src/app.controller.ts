import { BadRequestException, Controller, Get, HttpException, HttpStatus, Inject, UseFilters } from '@nestjs/common';
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
import KeyvRedis from '@keyv/redis';
import { EnhanceCacheService } from './service/caches/enhance-cache.service';
import { GeneralCacheService } from './service/caches/general-cache.service';

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
  ) { }

  @Get()
  async getHello() {
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
    return await this.i18n.t("hello.HELLO");
  }
}
