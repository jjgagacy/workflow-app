import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DefaultConfigValues } from "../constants/default-config-value";
import { getSafeNumber } from "../helpers/safe-number";

@Injectable()
export class PluginConfig {
  constructor(protected readonly configService: ConfigService) { }

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
    const maxBytes = this.configService.get<number>('PLUGIN_MAX_PACKAGE_SIZE', DefaultConfigValues.PLUGIN_MAX_PACKAGE_SIZE);
    return getSafeNumber(maxBytes, DefaultConfigValues.PLUGIN_MAX_PACKAGE_SIZE);
  }
}

@Injectable()
export class ModelPositionConfig {
  constructor(protected readonly configService: ConfigService) { }

  modelProviderPositionPins(): string[] {
    const pins = this.configService.get<string>('MODEL_PROVIDER_POSITION_PINS', '');
    return pins.split(',').map(item => item.trim()).filter(item => item !== '');
  }

  modelProviderPositionIncludes(): string[] {
    const includes = this.configService.get<string>('MODEL_PROVIDER_POSITION_INCLUDES', '');
    return includes.split(',').map(item => item.trim()).filter(item => item !== '');
  }

  modelProviderPositionExcludes(): string[] {
    const excludes = this.configService.get<string>('MODEL_PROVIDER_POSITION_EXCLUDES', '');
    return excludes.split(',').map(item => item.trim()).filter(item => item !== '');
  }

  toolPositionPins(): string[] {
    const pins = this.configService.get<string>('TOOL_POSITION_PINS', '');
    return pins.split(',').map(item => item.trim()).filter(item => item !== '');
  }

  toolPositionIncludes(): string[] {
    const includes = this.configService.get<string>('TOOL_POSITION_INCLUDES', '');
    return includes.split(',').map(item => item.trim()).filter(item => item !== '');
  }

  toolPositionExcludes(): string[] {
    const excludes = this.configService.get<string>('TOOL_POSITION_EXCLUDES', '');
    return excludes.split(',').map(item => item.trim()).filter(item => item !== '');
  }
}

