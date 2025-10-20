import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { MonieConfig } from './monie/monie.config';
import { GlobalLogger, LogLevels } from './logger/logger.service';
import { WinstonLogger } from './logger/winston.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from './generated/i18n.generated';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly monieConfig: MonieConfig,
    private readonly logger: GlobalLogger,
    private readonly winstonLogger: WinstonLogger,
  ) { }

  @Get()
  async getHello(@I18n() i18n: I18nContext<I18nTranslations>) {
    // console.log(this.monieConfig.redisHost())
    // this.logger.error("123");
    // this.winstonLogger.info('abc', { id: 1, name: 'foo' });
    // return this.appService.getHello();
    return await i18n.t("hello.HELLO");
  }
}
