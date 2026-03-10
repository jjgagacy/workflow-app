import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MarketplaceConfig {
  constructor(protected readonly configService: ConfigService) { }

  marketplaceModelProviders(): string[] {
    const providers = this.configService.get<string>('MARKETPLACE_MODEL_PROVIDERS') || '';
    return providers.split(',').map((item: string) => item.trim()).filter((item: string): item is string => !!item);
  }

  marketplacePluginsPath(): string {
    return this.configService.get<string>('MARKETPLACE_PLUGINS_PATH') || './plugins-declaration';
  }
}
