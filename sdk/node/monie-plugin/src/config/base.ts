import type { InstallMethod } from "./config.enum";

export interface PluginConfigContract {
  installMethod: InstallMethod;

  remoteInstallUrl?: string | undefined;
  remoteInstallHost?: string | undefined;
  remoteInstallPort?: number | undefined;
  rmoteInstallKey?: string | undefined;

  serverlessHost?: string | undefined;
  serverlessPort?: number | undefined;
  serverlessWorkers?: number | undefined;
  serverlessThreads?: number | undefined;

  maxRequestTimeout: number;
  pluginDaemonUrl: string;
}
