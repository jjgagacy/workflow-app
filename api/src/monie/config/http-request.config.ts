import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";
import { DefaultConfigValues } from "../constants/default-config-value";
import { getSafeNumber } from "../helpers/safe-number";

@Injectable()
export class HttpRequestConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    apiCompressionEnabled(): boolean {
        return toBoolean(this.configService.get<boolean>('API_COMPRESSION_ENABLED', false));
    }

    // Comma separated list of allowed origins for CORS
    apiCORSAllowOrigins(): string {
        return this.configService.get<string>('API_CORS_ALLOW_ORIGINS', '');
    }

    // Comma separated list of allowed origins for CORS for web app
    webCORSAllowOrigins(): string {
        return this.configService.get<string>('WEB_CORS_ALLOW_ORIGINS', '');
    }

    httpRequestMaxConnectTimeout(): number {
        const sec = this.configService.get<number>('HTTP_REQUEST_MAX_CONNECT_TIMEOUT', DefaultConfigValues.HTTP_REQUEST_MAX_CONNECT_TIMEOUT);
        return getSafeNumber(sec, DefaultConfigValues.HTTP_REQUEST_MAX_CONNECT_TIMEOUT);
    }

    httpRequestMaxReadTimeout(): number {
        const sec = this.configService.get<number>('HTTP_REQUEST_MAX_READ_TIMEOUT', DefaultConfigValues.HTTP_REQUEST_MAX_READ_TIMEOUT);
        return getSafeNumber(sec, DefaultConfigValues.HTTP_REQUEST_MAX_READ_TIMEOUT);
    }

    httpRequestMaxWriteTimeout(): number {
        const sec = this.configService.get<number>('HTTP_REQUEST_MAX_WRITE_TIMEOUT', DefaultConfigValues.HTTP_REQUEST_MAX_WRITE_TIMEOUT);
        return getSafeNumber(sec, DefaultConfigValues.HTTP_REQUEST_MAX_WRITE_TIMEOUT);
    }

    httpRequestMaxBinarySize(): number {
        const mb = this.configService.get<number>('HTTP_REQUEST_MAX_BINARY_SIZE', DefaultConfigValues.HTTP_REQUEST_MAX_BINARY_SIZE);
        return getSafeNumber(mb, DefaultConfigValues.HTTP_REQUEST_MAX_BINARY_SIZE);
    }

    httpRequestMaxTextSize(): number {
        const mb = this.configService.get<number>('HTTP_REQUEST_MAX_TEXT_SIZE', DefaultConfigValues.HTTP_REQUEST_MAX_TEXT_SIZE);
        return getSafeNumber(mb, DefaultConfigValues.HTTP_REQUEST_MAX_TEXT_SIZE);
    }

    httpRequestSSLVerificationEnabled(): boolean {
        return toBoolean(this.configService.get<boolean>('HTTP_REQUEST_SSL_VERIFICATION_ENABLED', true));
    }
}