import { PluginInstallerService } from "@/ai/plugin/services/plugin-installer.service";
import { MonieConfig } from "@/monie/monie.config";
import { BadRequestException, Injectable } from "@nestjs/common";
import { MarketplaceService } from "../marketplace.service";
import { getPluginIdFromUniqueIdentifier, isPluginId, isValidPluginUniqueIdentifier } from "@/ai/plugin/entities/identify";
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
      let uniqueIdentifier = identifer;
      // identifer may be a plugin_id (`author/name`), resolve it to its latest version's unique identifier
      if (isPluginId(uniqueIdentifier)) {
        const latest = await this.marketplaceService.findLatestPluginUniqueIdentifierByPluginId(uniqueIdentifier);
        if (!latest) {
          throw new BadRequestException("identifier invalid");
        }
        uniqueIdentifier = latest;
      }

      if (!isValidPluginUniqueIdentifier(uniqueIdentifier)) {
        throw new BadRequestException("identifier invalid");
      }
      const pluginUniqueIdentifier = await this.marketplaceService.findPluginUniqueIdentifier(uniqueIdentifier);
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

  async uninstallFromMarketplace(tenantId: string, identifiers: string[]): Promise<boolean> {
    const pluginInstallationId: string[] = [];

    const pluginInstallations = await this.installer.listPlugins(tenantId);

    for (const identifer of identifiers) {
      let pluginId: string | null = null;
      if (isPluginId(identifer)) {
        pluginId = identifer;
      } else if (isValidPluginUniqueIdentifier(identifer)) {
        const uniqueIdentifier = await this.marketplaceService.findPluginUniqueIdentifier(identifer);
        if (uniqueIdentifier) {
          pluginId = getPluginIdFromUniqueIdentifier(uniqueIdentifier);
        } else {
          throw new BadRequestException("identifier invalid");
        }
      }
      if (pluginId) {
        const pluginInstallation = pluginInstallations.find(pi => pi.pluginId === pluginId);
        if (pluginInstallation) {
          pluginInstallationId.push(pluginInstallation.installationId);
        } else {
          throw new BadRequestException("identifier invalid");
        }
        const uninstall = await this.installer.uninstall(tenantId, pluginInstallation.installationId);
        if (!uninstall) {
          return false;
        }
      } else {
        throw new BadRequestException("identifier invalid");
      }
    }

    return true;
  }
}
