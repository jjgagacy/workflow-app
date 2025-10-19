import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { MonieConfig } from './monie/monie.config';
import { GlobalLogger, LogLevels } from './logger/logger.service';
import { WinstonLogger } from './logger/winston.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly monieConfig: MonieConfig,
    private readonly logger: GlobalLogger,
    private readonly winstonLogger: WinstonLogger,
  ) { }

  @Get()
  getHello(): string {
    console.log(this.monieConfig.redisHost())
    // this.logger.error("123");
    // this.winstonLogger.info('abc', { id: 1, name: 'foo' });
    return this.appService.getHello();
  }

  getLogLevels(level: string): LogLevels[] {
    const levels: Record<string, LogLevels[]> = {
      error: ['error'],
      warn: ['error', 'warn'],
      info: ['error', 'warn', 'log'],
      debug: ['error', 'warn', 'log', 'debug'],
      verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
    };

    return levels[level] || levels['info'];
  }
}
