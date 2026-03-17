import { PluginInstallerService } from "@/ai/plugin/services/plugin-installer.service";
import { MonieConfig } from "@/monie/monie.config";
import { BadRequestException, Injectable } from "@nestjs/common";
import { MarketplaceService } from "../marketplace.service";
import { isValidPluginUniqueIdentifier, marshalPluginID } from "@/ai/plugin/entities/identify";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { PluginInstallationSource } from "@/ai/plugin/entities/plugin";

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
      const pluginUniqueIdentifier = await this.resolvePluginUniqueIdentifier(identifer);
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

  private async resolvePluginUniqueIdentifier(identifierOrModelProvider: string): Promise<string | null> {
    const pluginDeclarations = await this.marketplaceService.getPluginDeclarationsUseCache();
    let modelProviderDeclaration: PluginDeclaration | null = null;
    for (const pluginDeclaration of pluginDeclarations) {
      const pluginUniqueIdentifier = marshalPluginID(pluginDeclaration.author || '', pluginDeclaration.name, pluginDeclaration.version);

      if (pluginUniqueIdentifier === identifierOrModelProvider) {
        return pluginUniqueIdentifier;
      }

      if (pluginDeclaration.model) {
        if (pluginDeclaration.model.provider === identifierOrModelProvider) {
          modelProviderDeclaration = pluginDeclaration;
        }
      }
    }

    if (modelProviderDeclaration) {
      return marshalPluginID(modelProviderDeclaration.author || '', modelProviderDeclaration.name, modelProviderDeclaration.version);
    }

    return null
  }
}
