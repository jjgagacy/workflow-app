import { Logger } from "@nestjs/common";
import { QueryRunner, Logger as TypeORMLogger } from "typeorm";

export class TypeOrmLoggerSql implements TypeORMLogger {
    private readonly logger = new Logger('TypeOrmLogger');

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        throw new Error("Method not implemented.");
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        throw new Error("Method not implemented.");
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner) {
        throw new Error("Method not implemented.");
    }

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.log(`Query: ${query} Parameters: ${JSON.stringify(parameters)}`, 'TypeOrmLogger');
    }

    logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.error(`Query Error: ${error} Query: ${query} Parameters: ${JSON.stringify(parameters)}`, error, 'TypeOrmLogger');
    }

    private stringifyParams(parameters?: any[]) {
        return parameters ? `Parameters: ${JSON.stringify(parameters)}` : '';
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        throw new Error("Method not implemented.");
    }
}