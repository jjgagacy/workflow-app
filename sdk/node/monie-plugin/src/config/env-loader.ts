import dotenv, { config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';

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
}

export class EnvLoader {
  private loadedEnv: NodeJS.ProcessEnv = {};

  load(configPath?: string): NodeJS.ProcessEnv {
    const getEnvPath = () => {
      if (configPath) {
        const env = process.env.NODE_ENV || 'dev';
        const envSpecificFile = `.env.${env}`;
        const separator = path.sep;

        if (configPath.endsWith(separator)) {
          return configPath + envSpecificFile;
        }

        return path.join(configPath, envSpecificFile);
      }

      const env = process.env.NODE_ENV || 'dev';
      return `.env.${env}`;
    }

    const result = dotenv.config({
      path: getEnvPath(),
      debug: process.env.NODE_ENV === 'dev',
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
    }
  }
}
