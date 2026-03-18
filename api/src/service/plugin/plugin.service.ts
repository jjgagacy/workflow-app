import { PluginInstallerService } from "@/ai/plugin/services/plugin-installer.service";
import { MonieConfig } from "@/monie/monie.config";
import { BadRequestException, Injectable } from "@nestjs/common";
import { MarketplaceService } from "../marketplace.service";
import { isValidPluginUniqueIdentifier } from "@/ai/plugin/entities/identify";
import { PluginInstallationSource } from "@/ai/plugin/entities/plugin";
import { PluginInstallation } from "@/ai/plugin/entities/plugin-installation";

@Injectable()
export class PluginService {
  constructor(
    protected readonly monieConfig: MonieConfig,
    protected readonly installer: PluginInstallerService,
    protected readonly marketplaceService: MarketplaceService
  ) { }

  async installFromMarketplace(tenantId: string, identifiers: string[]): Promise<{ allInstalled: boolean }> {
    if (!this.monieConfig.marketplaceEnabled()) {
      throw new BadRequestException("marketplace is not enabled");
    }

    const pluginUniqueIdentifiers: string[] = [];
    const metas: Record<string, string>[] = [];

    for (const identifer of identifiers) {
      if (!isValidPluginUniqueIdentifier(identifer)) {
        throw new BadRequestException("identifier invalid");
      }
      const pluginUniqueIdentifier = await this.marketplaceService.findPluginUniqueIdentifier(identifer);
      if (pluginUniqueIdentifier) {
        pluginUniqueIdentifiers.push(pluginUniqueIdentifier);
        metas.push({ pluginUniqueIdentifier })
      } else {
        throw new BadRequestException("identifier invalid");
      }
    }

    const { allInstalled } = await this.installer.installFromIdentifiers(tenantId, pluginUniqueIdentifiers, PluginInstallationSource.Marketplace, metas);
    return { allInstalled };
  }

  async listPluginsFromIds(tenantId: string, pluginIds: string[]): Promise<PluginInstallation[]> {
    return this.installer.fetchPluginInstallationByPluginIds(tenantId, pluginIds);
  }
}
