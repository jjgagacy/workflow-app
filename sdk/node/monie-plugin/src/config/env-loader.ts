import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'node:path';
import fs from 'node:fs';

export class RawEnvConfig {
  INSTALL_METHOD: string | undefined;
  REMOTE_INSTALL_URL: string | undefined;
  REMOTE_INSTALL_HOST: string | undefined;
  REMOTE_INSTALL_PORT: string | undefined
  REMOTE_INSTALL_KEY: string | undefined;

  SERVERLESS_HOST: string | undefined;
  SERVERLESS_PORT: string | undefined
  SERVERLESS_WORKERS: string | undefined;
  SERVERLESS_THREADS: string | undefined;

  MAX_REQUEST_TIMEOUT: string | undefined;
  PLUGIN_DAEMON_URL: string | undefined;

  BASE_DIR: string | undefined;
  DISABLE_WORKER: string | undefined;

  HEARTBEAT_INTERVAL: string | undefined; // seconds
}

export class EnvLoader {
  private loadedEnv: NodeJS.ProcessEnv = {};

  load(configPath?: string): NodeJS.ProcessEnv {
    const getEnvPath = () => {
      const env = process.env.NODE_ENV || 'dev';
      const envSpecificFile = `.env.${env}`;
      const defaultFile = '.env';

      const targetDir = configPath || '';
      const envSpecificPath = path.join(targetDir, envSpecificFile);
      const defaultPath = path.join(targetDir, defaultFile);

      // 1. 优先校验环境特定文件是否存在 (.env.dev / .env.test 等)
      if (fs.existsSync(envSpecificPath)) {
        return envSpecificPath;
      }

      // 2. 文件不存在时自动回退至通用 .env
      return defaultPath;
    }

    const result = dotenv.config({
      path: getEnvPath(),
      encoding: 'utf8',
      debug: false, // process.env.NODE_ENV === 'dev',
      override: true,
      quiet: true,
    })

    if (result.parsed) {
      dotenvExpand.expand({ parsed: result.parsed })
    }

    this.loadedEnv = { ...process.env };
    return this.loadedEnv;
  }

  getRawEnv(): RawEnvConfig {
    return {
      INSTALL_METHOD: this.loadedEnv.INSTALL_METHOD,
      REMOTE_INSTALL_URL: this.loadedEnv.REMOTE_INSTALL_URL,
      REMOTE_INSTALL_HOST: this.loadedEnv.REMOTE_INSTALL_HOST,
      REMOTE_INSTALL_PORT: this.loadedEnv.REMOTE_INSTALL_PORT,
      REMOTE_INSTALL_KEY: this.loadedEnv.REMOTE_INSTALL_KEY,
      SERVERLESS_HOST: this.loadedEnv.SERVERLESS_HOST,
      SERVERLESS_PORT: this.loadedEnv.SERVERLESS_PORT,
      SERVERLESS_WORKERS: this.loadedEnv.SERVERLESS_WORKERS,
      SERVERLESS_THREADS: this.loadedEnv.SERVERLESS_THREADS,
      MAX_REQUEST_TIMEOUT: this.loadedEnv.MAX_REQUEST_TIMEOUT,
      PLUGIN_DAEMON_URL: this.loadedEnv.PLUGIN_DAEMON_URL,
      BASE_DIR: this.loadedEnv.BASE_DIR,
      DISABLE_WORKER: this.loadedEnv.DISABLE_WORKER,
      HEARTBEAT_INTERVAL: this.loadedEnv.HEARTBEAT_INTERVAL,
    }
  }
}
