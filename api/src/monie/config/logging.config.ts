import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class LoggingConfig {
  constructor(protected readonly configService: ConfigService
  ) { }

  logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'verbose');
  }

  winstonLogLevel(): string {
    return this.configService.get<string>('WINSTON_LOG_LEVEL', 'notice');
  }

  winstonLogDir(): string {
    return this.configService.get<string>('WINSTON_LOG_DIR', 'logs');
  }

  winstonDailyRotateEnabled(): boolean {
    return this.configService.get<boolean>('WINSTON_DAILY_ROTATE_ENABLED', false);
  }

  winstonFileName(): string {
    return this.configService.get<string>('WINSTON_FILE_NAME', 'application.log');
  }

  winstonRotateFileName(): string {
    return this.configService.get<string>('WINSTON_ROTATE_FILE_NAME', 'application-%DATE%.log');
  }

  winstonMaxFiles(): string {
    return this.configService.get<string>('WINSTON_MAX_FILES', '14d');
  }

  winstonDatePattern(): string {
    return this.configService.get<string>('WINSTON_DATE_PATTERN', 'YYYY-MM-DD');
  }

  winstonZippedArchive(): boolean {
    return toBoolean(this.configService.get<boolean>('WINSTON_ZIPPED_ARCHIVE', true));
  }

  winstonMaxSize(): string {
    return this.configService.get<string>('WINSTON_MAX_SIZE', '20m');
  }
}