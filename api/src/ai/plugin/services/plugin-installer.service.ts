import { Injectable } from "@nestjs/common";
import { BasePluginClient } from "../../../monie/classes/base-plugin-client";
import { PluginDeclaration } from "@/ai/model_runtime/classes/plugin/declaration";
import { PluginInstallationSource } from "../entities/plugin";

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
    throw new Error();
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
}