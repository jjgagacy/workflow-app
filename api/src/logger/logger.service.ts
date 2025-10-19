import { ConsoleLogger, Injectable, LoggerService, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WinstonLogger } from "./winston.service";

export type LogLevels = 'error' | 'warn' | 'log' | 'debug' | 'verbose';
export interface LogContext {
    [key: string]: any;
}

@Injectable()
export class GlobalLogger extends ConsoleLogger implements LoggerService {
    private readonly logLevels: LogLevels[];
    private readonly isProduction: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly winstonLogger: WinstonLogger,
        @Optional() context?: string,
    ) {
        super()
        this.setContext(context || 'GlobalLogger')
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
        this.logLevels = this.getLogLevels();
    }

    private getLogLevels(): LogLevels[] {
        const level = this.configService.get<LogLevels>('LOG_LEVEL', 'verbose');

        const levels: Record<string, LogLevels[]> = {
            error: ['error'],
            warn: ['error', 'warn'],
            info: ['error', 'warn', 'log'],
            debug: ['error', 'warn', 'log', 'debug'],
            verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
        };

        return levels[level] || levels['info'];
    }

    log(message: string, context?: string | LogContext) {
        if (!this.shouldLog('log')) return;

        const logData = this.formatLogData('INFO', message, context)
        super.log(logData.message, logData.context);

        const meta = this.createMetaData(context);
        this.winstonLogger.info(logData.message, meta);
    }

    error(message: string, context?: string | LogContext, trace?: string) {
        if (!this.shouldLog('error')) return;

        const logData = this.formatLogData('ERROR', message, context);
        super.error(logData.message, trace, logData.context);

        const meta = this.createMetaData(context, trace);
        this.winstonLogger.error(message, meta);
    }

    warn(message: string, context?: string | LogContext) {
        if (!this.shouldLog('warn')) return;

        const logData = this.formatLogData('WARN', message, context);
        super.warn(logData.message, logData.context);

        const meta = this.createMetaData(context);
        this.winstonLogger.warn(message, meta);
    }

    debug(message: string, context?: string | LogContext) {
        if (!this.shouldLog('debug')) return;

        const logData = this.formatLogData('DEBUG', message, context);
        super.debug(logData.message, logData.context);

        const meta = this.createMetaData(context);
        this.winstonLogger.debug(message, meta);
    }

    verbose(message: string, context?: string | LogContext) {
        if (!this.shouldLog('verbose')) return;

        const logData = this.formatLogData('VERBOSE', message, context);
        super.verbose(logData.message, logData.context);

        const meta = this.createMetaData(context);
        this.winstonLogger.verbose(message, meta);
    }

    business(operation: string, data: LogContext, context?: string) {
        const message = `Business Operation: ${operation}`;
        const logContext: LogContext = {
            type: 'BUSINESS',
            operation,
            ...data,
            ...(context && { service: context }),
        };

        this.log(message, logContext);
    }

    performance(operation: string, duration: number, context?: string | LogContext) {
        const message = `Performance: ${operation} took ${duration}ms`;
        const logContext: LogContext = {
            type: 'PERFORMANCE',
            operation,
            duration,
            ...(typeof context === 'object' ? context : { service: context }),
        };

        this.log(message, logContext);
        this.winstonLogger.info(message, logContext);
    }

    audit(action: string, user: string, details: LogContext, context?: string) {
        const message = `Audit: ${action} by ${user}`;
        const logContext: LogContext = {
            type: 'AUDIT',
            action,
            user,
            timestamp: new Date().toISOString(),
            ...details,
            ...(context && { service: context }),
        };

        this.log(message, logContext);
        this.winstonLogger.info(message, logContext);
    }

    security(event: string, details: LogContext, context?: string) {
        const message = `Security: ${event}`;
        const logContext: LogContext = {
            type: 'SECURITY',
            event,
            timestamp: new Date().toISOString(),
            ip: details.ip,
            userAgent: details.userAgent,
            ...details,
            ...(context && { service: context }),
        };

        this.warn(message, logContext);
        this.winstonLogger.info(message, logContext);
    }

    database(operation: string, collection: string, duration?: number, context?: string | LogContext) {
        const message = `Database: ${operation} on ${collection}`;
        const logContext: LogContext = {
            type: 'DATABASE',
            operation,
            collection,
            ...(duration && { duration }),
            ...(typeof context === 'object' ? context : { service: context }),
        };

        this.debug(message, logContext);
        this.winstonLogger.info(message, logContext);
    }

    apiRequest(method: string, url: string, statusCode: number, duration: number, context?: string) {
        const message = `API: ${method} ${url} - ${statusCode} (${duration}ms)`;
        const logContext: LogContext = {
            type: 'API_REQUEST',
            method,
            url,
            statusCode,
            duration,
            timestamp: new Date().toISOString(),
            ...(context && { service: context }),
        };

        this.log(message, logContext);
        this.winstonLogger.info(message, logContext);
    }

    private shouldLog(level: LogLevels): boolean {
        return this.logLevels.includes(level);
    }

    private formatLogData(level: string, message: string, context?: string | LogContext) {
        const timestamp = new Date().toISOString()

        if (typeof context === 'object') {
            return {
                level,
                message,
                context: JSON.stringify({
                    timestamp,
                    level,
                    ...context,
                }),
            }
        } else {
            return {
                level,
                message,
                context: context || this.context,
            }
        }
    }

    private createMetaData(context?: string | LogContext, trace?: string): LogContext {
        const meta: LogContext = {};
        if (typeof context === 'string') {
            meta.context = context;
        } else {
            Object.assign(meta, context);
        }
        if (trace) {
            meta.trace = trace;
        }
        return meta;
    }

}