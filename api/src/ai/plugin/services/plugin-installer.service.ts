import { Injectable } from "@nestjs/common";
import { BasePluginClient } from "../../../monie/classes/base-plugin-client";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { PluginInstallationSource } from "../entities/plugin";
import { PluginInstallation } from "../entities/plugin-installation";
import { deepSnakeToCamel } from "@/common/utils/string";
import { ProviderID } from "../entities/provider-id.entities";

export interface PluginInstallTaskResponse {
  allInstalled: boolean;
  taskId: string;
}

@Injectable()
export class PluginInstallerService {
  constructor(
    private readonly baseClient: BasePluginClient
  ) { }

  async fetchPluginManifest(tenantId: string, pluginUniqueIdentifier: string): Promise<PluginDeclaration> {
    return new Promise((resolve, reject) => {
      this.baseClient.requestWithPluginDaemonResponse(
        'GET',
        `plugin/${tenantId}/management/fetch/manifest`,
        {
          params: {
            plugin_unique_identifier: pluginUniqueIdentifier
          }
        }
      ).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });
  }

  async installFromIdentifiers(
    tenantId: string,
    pluginUniqueIdentifiers: string[],
    source: PluginInstallationSource,
    metas: Record<string, string>[]
  ): Promise<PluginInstallTaskResponse> {
    return new Promise((resolve, reject) => {
      this.baseClient.requestWithPluginDaemonResponse(
        'POST',
        `plugin/${tenantId}/management/install/identifiers`,
        {
          data: {
            plugin_unique_identifiers: pluginUniqueIdentifiers,
            source,
            metas
          }
        }
      ).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });
  }

  async listPlugins(tenantId: string): Promise<PluginInstallation[]> {
    return new Promise((resolve, reject) => {
      this.baseClient.requestWithPluginDaemonResponse(
        'GET',
        `plugin/${tenantId}/management/list`,
        {
          params: { page: "1", page_size: "256", }
        }
      ).subscribe({
        next: (response) => resolve(response.list),
        error: (error) => reject(error),
      });
    });
  }

  async fetchPluginInstallationByPluginIds(tenantId: string, pluginIds: string[]): Promise<PluginInstallation[]> {
    return new Promise((resolve, reject) => {
      this.baseClient.requestWithPluginDaemonResponse(
        'POST',
        `plugin/${tenantId}/management/installation/fetch/batch`,
        {
          data: { plugin_ids: pluginIds },
        }
      ).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });
  }

  async checkToolExistence(tenantId: string, providerIds: ProviderID[]): Promise<boolean[]> {
    return new Promise((resolve, reject) => {
      this.baseClient.requestWithPluginDaemonResponse(
        'POST',
        `plugin/${tenantId}/management/tool/check_existence`,
        {
          data: { provider_ids: providerIds.map(id => ({ plugin_id: id.pluginId, provider: id.providerName })) },
        }
      ).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });
  }
}