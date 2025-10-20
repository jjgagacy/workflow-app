import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'winston-daily-rotate-file';
import { MonieConfig } from '@/monie/monie.config';

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        http: 4,
        verbose: 5,
        input: 6,
        silly: 7,
        data: 8,
        help: 9,
        prompt: 10,
        emerg: 11,
        alert: 12,
        crit: 13,
        notice: 14,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        http: 'magenta',
        verbose: 'cyan',
        input: 'grey',
        silly: 'magenta',
        data: 'white',
        help: 'cyan',
        prompt: 'grey',
        emerg: 'red',
        alert: 'yellow',
        crit: 'red',
        notice: 'blue',
    },
};

@Injectable()
export class WinstonLogger {
    private readonly logger: winston.Logger;

    constructor(
        private readonly configService: ConfigService,
        private readonly monieConfig: MonieConfig,
    ) {
        const rootDir = process.cwd();
        const filename = this.monieConfig.winstonFileName();
        const rotateFilename = this.monieConfig.winstonRotateFileName();
        const logDir = path.join(rootDir, 'public', this.configService.get<string>('WINSTON_LOG_DIR', this.monieConfig.winstonLogDir()))

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // register custom colors with winston
        winston.addColors(customLevels.colors);
        const isProduction = this.configService.get<string>('NODE_ENV') !== 'production';

        this.logger = winston.createLogger({
            level: this.monieConfig.winstonLogLevel(),
            levels: customLevels.levels,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize({ all: true, colors: customLevels.colors }),
                winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                    let log = `${timestamp} [${level}]: ${message}`;

                    if (context) {
                        log += ` [${context}]`;
                    }

                    // 添加其他元数据（如果有）
                    const metaKeys = Object.keys(meta).filter(key =>
                        key !== 'timestamp' && key !== 'level' && key !== 'message'
                    );

                    if (metaKeys.length > 0) {
                        log += ` | ${JSON.stringify(meta)}`;
                    }

                    return log;
                }),
            ),
            transports: [
                ...(isProduction ? [
                    new winston.transports.DailyRotateFile({
                        level: this.monieConfig.winstonLogLevel(), // 生产环境建议使用 info 而不是 data
                        filename: rotateFilename != '' ? rotateFilename : filename,
                        dirname: logDir,
                        format: winston.format.uncolorize(),
                        zippedArchive: this.monieConfig.winstonZippedArchive(),
                        datePattern: this.monieConfig.winstonDatePattern(),
                        maxFiles: this.monieConfig.winstonMaxFiles(),
                        maxSize: this.monieConfig.winstonMaxSize(),
                    })
                ] : [
                    new winston.transports.File({
                        level: this.monieConfig.winstonLogLevel(),
                        filename: filename,
                        dirname: logDir,
                        format: winston.format.uncolorize(),
                    })
                ]),
            ]
        });

        if (isProduction) {
            this.logger.add(
                new winston.transports.Console()
            )
        }
    }

    error(message: string, context?: any) {
        this.logger.error(message, context);
    }

    warn(message: string, context?: any) {
        this.logger.warn(message, context);
    }

    help(message: string, context?: any) {
        this.logger.help(message, context);
    }

    data(message: string, context?: any) {
        this.logger.data(message, context);
    }

    info(message: string, context?: any) {
        this.logger.info(message, context);
    }

    debug(message: string, context?: any) {
        this.logger.debug(message, context);
    }

    prompt(message: string, context?: any) {
        this.logger.prompt(message, context);
    }

    verbose(message: string, context?: any) {
        this.logger.verbose(message, context);
    }

    http(message: string, context?: any) {
        this.logger.http(message);
    }

    silly(message: string, context?: any) {
        this.logger.silly(message, context);
    }

    input(message: string, context?: any) {
        this.logger.input(message, context);
    }

    // for syslog levels only
    alert(message: string, context?: any) {
        this.logger.alert(message, context);
    }

    crit(message: string, context?: any) {
        this.logger.crit(message, context);
    }

    notice(message: string, context?: any) {
        this.logger.notice(message, context);
    }

    emerg(message: string, context?: any) {
        this.logger.emerg(message, context);
    }
}
