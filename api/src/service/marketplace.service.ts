import { PromptMessageContent } from "@/ai/prompt/classes/abstract.class";
import { EnhanceCacheService } from "@/common/services/cache/enhance-cache.service";
import { MonieConfig } from "@/monie/monie.config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PluginDeclarationService } from "./plugin/plugin-declaration.service";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { supportedLanguage, SupportedLanguage } from "@/common/constants/timezone";
import { EmailLanguage } from "@/mail/mail-i18n.service";
import { I18nObject } from "@/ai/model_runtime/classes/model-runtime.class";
import { ModelProviderDeclaration } from "@/ai/model_runtime/classes/model-provider.class";
import { i18nLangMap } from "@/i18n-global/langmap";
import { ModelProviderQueryProps } from "./types/model-provider.type";
import { PluginProviderType } from "@/ai/model_runtime/classes/plugin/plugin";
import { ProviderID } from "@/ai/plugin/entities/provider-id.entities";
import { marshalPluginID } from "@/ai/plugin/entities/identify";

export type IconLanguage = 'en_US' | 'zh_Hans';
const cacheKeyPluginDeclarations = 'marketplace_plugin_declarations';
const cacheTTLPluginDeclarations = 5000;

@Injectable()
export class MarketplaceService {
  constructor(
    protected readonly monieConfig: MonieConfig,
    protected readonly cacheService: EnhanceCacheService,
    protected readonly pluginDeclarationService: PluginDeclarationService
  ) { }

  async initPluginDeclarations(): Promise<PluginDeclaration[]> {
    const pluginPath = this.monieConfig.marketplacePluginsPath();
    const pluginDeclarations = await this.pluginDeclarationService.decodePluginPath(pluginPath);
    console.log(`Loaded ${pluginDeclarations.length} plugin declarations from marketplace.`);
    return pluginDeclarations;
  }

  async getPluginDeclarationsUseCache(): Promise<PluginDeclaration[]> {
    const cached = await this.cacheService.get<PluginDeclaration[]>(cacheKeyPluginDeclarations);
    if (cached) {
      return cached;
    }
    const pluginDeclarations = await this.initPluginDeclarations();
    await this.cacheService.set(cacheKeyPluginDeclarations, pluginDeclarations, cacheTTLPluginDeclarations);
    return pluginDeclarations;
  }

  async queryModelProviders(props?: ModelProviderQueryProps): Promise<PluginDeclaration[]> {
    const pluginDeclarations = await this.getPluginDeclarationsUseCache();

    return pluginDeclarations.filter(declaration => {
      if (props?.category) {
        if (props.category === PluginProviderType.Model) {
          if (!declaration.model) {
            return false;
          }

          if (props.excludes && props.excludes.includes(declaration.model.provider)) {
            return false;
          }
        } else if (props.category === PluginProviderType.Tool) {
          if (!declaration.tool) {
            return false;
          }

          if (props.excludes) {
            const toolProviders = declaration.tool.tools.map(tool => tool.identity.name);
            if (toolProviders.some(provider => props.excludes!.includes(provider))) {
              return false;
            }
          }
        } else if (props.category === PluginProviderType.Endpoint) {
          if (!declaration.endpoint) {
            return false;
          }

          if (props.excludes) {
            const endpointPaths = declaration.endpoint.endpoints.map(endpoint => endpoint.path);
            if (endpointPaths.some(path => props.excludes!.includes(path))) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }

  async getModelProviderIcon(
    provider: string,
    theme: string = 'light',
    language: IconLanguage = 'en_US',
    useSmall: boolean = false
  ): Promise<{ data: Buffer, mimeType: string } | null> {
    const pluginDeclaration = (await this.getPluginDeclarationsUseCache()).find(declaration => declaration.model?.provider === provider);
    if (!pluginDeclaration) {
      return null;
    }

    const iconPath = this.getModelProviderIconPath(pluginDeclaration, theme, language, useSmall);
    if (!iconPath) {
      return null;
    }

    const fullIconPath = `${this.monieConfig.marketplacePluginsPath()}/${pluginDeclaration.name}/${iconPath}`;

    try {
      const iconData = await this.pluginDeclarationService.readPluginFile(fullIconPath);
      const mimeType = this.pluginDeclarationService.getFileMimeType(fullIconPath);
      return { data: iconData, mimeType };
    } catch (error) {
      console.error(`Error reading icon file at "${fullIconPath}": ${(error as Error).message}`);
      return null;
    }
  }

  getModelProviderIconPath(pluginDeclaration: PluginDeclaration, theme: string, language: string, useSmall: boolean): string | null {
    if (!pluginDeclaration.model) {
      return null;
    }
    const iconKey = useSmall ? 'iconSmall' : (theme === 'dark' ? 'iconLargeDark' : 'iconLarge');
    const iconPath = pluginDeclaration.model[iconKey as keyof ModelProviderDeclaration] as I18nObject | undefined;
    if (!iconPath) {
      return null;
    }
    return iconPath[language] || null;
  }

  getModelProviderIconUrl(provider: string, theme: string = 'light', language: IconLanguage = 'en_US', useSmall: boolean = false): string | null {
    const baseUrl = this.monieConfig.filesUrl() || 'http://localhost:3001';

    return `${baseUrl}/files/preview/model-provider/icon/` +
      `${provider}/${theme}/${language.replace(/_/g, '-')}/` +
      `${useSmall ? 'small' : 'large'}`;
  }

  getModelProviderType(declaration: PluginDeclaration): string {
    if (declaration.model) {
      return PluginProviderType.Model;
    } else if (declaration.tool) {
      return PluginProviderType.Tool;
    } else if (declaration.endpoint) {
      return PluginProviderType.Endpoint;
    }
    return 'unknown';
  }

  async findPluginUniqueIdentifier(identifierOrPluginId: string): Promise<string | null> {
    const pluginDeclarations = await this.getPluginDeclarationsUseCache();
    for (const pluginDeclaration of pluginDeclarations) {
      const providerId = new ProviderID(pluginDeclaration.author + '/' + pluginDeclaration.name);
      const pluginUniqueIdentifier = marshalPluginID(pluginDeclaration.author || '', pluginDeclaration.name, pluginDeclaration.version);

      if (pluginUniqueIdentifier === identifierOrPluginId) {
        return pluginUniqueIdentifier;
      } else if (providerId.pluginId === identifierOrPluginId) {
        return pluginUniqueIdentifier;
      }
    }
    return null
  }
}

export function convertToIconLanguage(language: string): IconLanguage {
  if (language in i18nLangMap) {
    switch (language) {
      case 'en-US':
        return 'en_US';
      case 'zh-Hans':
        return 'zh_Hans';
    }
  }
  return 'en_US';
}