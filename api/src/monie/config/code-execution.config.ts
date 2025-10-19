import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

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
        const sec = this.configService.get<number>('CODE_EXECUTION_CONNECT_TIMEOUT', 10.0);
        return Number(sec)
    }

    codeExecutionReadTimeout(): number {
        const sec = this.configService.get<number>('CODE_EXECUTION_READ_TIMEOUT', 60.0);
        return Number(sec)
    }

    codeExecutionWriteTimeout(): number {
        const sec = this.configService.get<number>('CODE_EXECUTION_WRITE_TIMEOUT', 60.0);
        return Number(sec)
    }

    codeMaxNumber(): number {
        const num = this.configService.get<number>('CODE_EXECUTION_MAX_NUMBER', 9000000000000);
        return Number(num);
    }

    codeMinNumber(): number {
        const num = this.configService.get<number>('CODE_EXECUTION_MIN_NUMBER', -9000000000000);
        return Number(num);
    }

    codeMaxDepth(): number {
        const num = this.configService.get<number>('CODE_MAX_DEPTH', 5);
        return Number(num);
    }

    codeMaxPrecision(): number {
        const num = this.configService.get<number>('CODE_MAX_PRECISION', 20);
        return Number(num);
    }

    codeMaxStringLength(): number {
        const num = this.configService.get<number>('CODE_MAX_STRING_LENGTH', 30);
        return Number(num);
    }

    codeMaxObjectArrayLength(): number {
        const num = this.configService.get<number>('CODE_MAX_OBJECT_ARRAY_LENGTH', 30);
        return Number(num);
    }

    codeMaxNumberArrayLength(): number {
        const num = this.configService.get<number>('CODE_MAX_NUMBER_ARRAY_LENGTH', 1000);
        return Number(num);
    }
}