import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { defaultConfigValues } from "../constants/default-config-value";
import { getSafeNumber } from "../helpers/safe-number";

@Injectable()
export class PluginConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    pluginBaseUrl(): string {
        return this.configService.get<string>('PLUING_BASE_URL', 'http://localhost:5002')
    }

    pluginApiKey(): string {
        return this.configService.get<string>('PLUGIN_API_KEY', '')
    }

    pluginInnerApiKey(): string {
        return this.configService.get<string>('PLUGIN_INNER_API_KEY', '')
    }

    pluginMaxPackageSize(): number {
        const maxBytes = this.configService.get<number>('PLUGIN_MAX_PACKAGE_SIZE', defaultConfigValues.PLUGIN_MAX_PACKAGE_SIZE);
        return getSafeNumber(maxBytes, defaultConfigValues.PLUGIN_MAX_PACKAGE_SIZE);
    }
}