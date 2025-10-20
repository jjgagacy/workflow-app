import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { defaultConfigValues } from "../constants/default-config-value";
import { getSafeNumber } from "../helpers/safe-number";

@Injectable()
export class CodeExecutionConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    codeExecutionEndPoint(): string {
        return this.configService.get<string>('CODE_EXECUTION_ENDPOINT', '');
    }

    codeExecutionApiKey(): string {
        return this.configService.get<string>('CODE_EXECUTION_API_KEY', '');
    }

    codeExecutionConnectTimeout(): number {
        const sec = this.configService.get<number>('CODE_EXECUTION_CONNECT_TIMEOUT', defaultConfigValues.CODE_EXECUTION_CONNECT_TIMEOUT);
        return getSafeNumber(sec, defaultConfigValues.CODE_EXECUTION_CONNECT_TIMEOUT);
    }

    codeExecutionReadTimeout(): number {
        const sec = this.configService.get<number>('CODE_EXECUTION_READ_TIMEOUT', defaultConfigValues.CODE_EXECUTION_READ_TIMEOUT);
        return getSafeNumber(sec, defaultConfigValues.CODE_EXECUTION_READ_TIMEOUT);
    }

    codeExecutionWriteTimeout(): number {
        const sec = this.configService.get<number>('CODE_EXECUTION_WRITE_TIMEOUT', defaultConfigValues.CODE_EXECUTION_WRITE_TIMEOUT);
        return getSafeNumber(sec, defaultConfigValues.CODE_EXECUTION_WRITE_TIMEOUT);
    }

    codeMaxNumber(): number {
        const num = this.configService.get<number>('CODE_EXECUTION_MAX_NUMBER', defaultConfigValues.CODE_EXECUTION_MAX_NUMBER);
        return getSafeNumber(num, defaultConfigValues.CODE_EXECUTION_MAX_NUMBER);
    }

    codeMinNumber(): number {
        const num = this.configService.get<number>('CODE_EXECUTION_MIN_NUMBER', defaultConfigValues.CODE_EXECUTION_MIN_NUMBER);
        return getSafeNumber(num, defaultConfigValues.CODE_EXECUTION_MIN_NUMBER);
    }

    codeMaxDepth(): number {
        const num = this.configService.get<number>('CODE_MAX_DEPTH', defaultConfigValues.CODE_MAX_DEPTH);
        return getSafeNumber(num, defaultConfigValues.CODE_MAX_DEPTH);
    }

    codeMaxPrecision(): number {
        const num = this.configService.get<number>('CODE_MAX_PRECISION', defaultConfigValues.CODE_MAX_PRECISION);
        return getSafeNumber(num, defaultConfigValues.CODE_MAX_PRECISION);
    }

    codeMaxStringLength(): number {
        const num = this.configService.get<number>('CODE_MAX_STRING_LENGTH', defaultConfigValues.CODE_MAX_STRING_LENGTH);
        return getSafeNumber(num, defaultConfigValues.CODE_MAX_STRING_LENGTH);
    }

    codeMaxObjectArrayLength(): number {
        const num = this.configService.get<number>('CODE_MAX_OBJECT_ARRAY_LENGTH', defaultConfigValues.CODE_MAX_OBJECT_ARRAY_LENGTH);
        return getSafeNumber(num, defaultConfigValues.CODE_MAX_OBJECT_ARRAY_LENGTH);
    }

    codeMaxNumberArrayLength(): number {
        const num = this.configService.get<number>('CODE_MAX_NUMBER_ARRAY_LENGTH', defaultConfigValues.CODE_MAX_NUMBER_ARRAY_LENGTH);
        return getSafeNumber(num, defaultConfigValues.CODE_MAX_NUMBER_ARRAY_LENGTH);
    }
}