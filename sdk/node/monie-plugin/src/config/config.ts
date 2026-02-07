import { EnumUtils } from "../utils/enum.util.js";
import { InstallMethod } from "./config.enum.js";
import { IPluginConfig } from "./base.js";
import { EnvLoader, RawEnvConfig } from "./env-loader.js";

export class PluginConfig implements IPluginConfig {
  heartbeatInterval: number;
  installMethod: InstallMethod;

  remoteInstallUrl: string | undefined;
  remoteInstallHost: string | undefined;
  remoteInstallPort: number | undefined;
  remoteInstallKey: string | undefined;

  serverlessHost: string | undefined;
  serverlessPort: number | undefined;
  serverlessWorkers: number | undefined;
  serverlessThreads: number | undefined;

  maxRequestTimeout: number;
  pluginDaemonUrl: string;

  disableWorker!: boolean;
  baseDir!: string;

  constructor(private envLoader: EnvLoader) {
    const rawEnv = this.envLoader.getRawEnv();
    this.heartbeatInterval = this.parseNumber(rawEnv.HEARTBEAT_INTERVAL, 10)!;
    this.installMethod = this.parseInstallMethod(rawEnv.INSTALL_METHOD);
    this.maxRequestTimeout = this.parseNumber(rawEnv.MAX_REQUEST_TIMEOUT, 300)!;
    this.pluginDaemonUrl = this.parseUrl(rawEnv.PLUGIN_DAEMON_URL, 'http://localhost:50002');
    this.transformAndValidate(rawEnv);
  }

  private transformAndValidate(rawEnv: RawEnvConfig) {
    this.baseDir = rawEnv.BASE_DIR || '';
    this.disableWorker = rawEnv.DISABLE_WORKER === '1' || rawEnv.DISABLE_WORKER === 'true';
    this.remoteInstallUrl = rawEnv.REMOTE_INSTALL_URL;
    this.remoteInstallHost = rawEnv.REMOTE_INSTALL_HOST;
    this.remoteInstallPort = this.parseNumber(rawEnv.REMOTE_INSTALL_PORT)
    this.remoteInstallKey = rawEnv.REMOTE_INSTALL_KEY;

    this.serverlessHost = rawEnv.SERVERLESS_HOST;
    this.serverlessPort = this.parseNumber(rawEnv.SERVERLESS_PORT);
    this.serverlessThreads = this.parseNumber(rawEnv.SERVERLESS_THREADS);
    this.serverlessWorkers = this.parseNumber(rawEnv.SERVERLESS_WORKERS);
  }

  private parseInstallMethod(installMethod: string | undefined): InstallMethod {
    const method = (installMethod || 'local').toLowerCase();
    if (!EnumUtils.isEnumValue(InstallMethod, method)) {
      throw new Error(
        `INSTALL_METHOD must be valid`
      );
    }

    return method as InstallMethod;
  }

  private parseUrl(value: string | undefined, defaultValue: string): string {
    const url = this.parseString(value, defaultValue);
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  private parseString(value: string | undefined, defaultValue: string): string {
    return value?.trim() || defaultValue;
  }

  private parseNumber(value: string | undefined, defaultValue?: number | undefined): number | undefined {
    if (value === undefined || value === '') {
      return defaultValue;
    }

    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error(`Value must be a number: ${value}`);
    }
    return num;
  }
}

