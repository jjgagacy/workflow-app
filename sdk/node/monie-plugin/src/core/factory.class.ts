import { InstallMethod } from "../config/config.enum.js";
import { StreamPair } from "./streams/stream.js";
import { StdioReader } from "../server/stdio/stdio-reader.class.js";
import { StdioWriter } from "../server/stdio/stdio-writer.class.js";
import { TCPReaderWriter } from "../server/tcp/tcp-reader.class.js";
import { ServerlessRequestReader } from "../server/serverless/request-reader.class.js";
import { ServerlessResponseWriter } from "../server/serverless/response-writer.class.js";
import { PluginConfig } from "../config/config.js";

export class StreamFactory {
  static create(config: PluginConfig): StreamPair {
    switch (config.installMethod) {
      case InstallMethod.LOCAL:
        return { reader: new StdioReader(), writer: new StdioWriter() };
      case InstallMethod.REMOTE:
        return StreamFactory.launchRemoteStream(config);
      case InstallMethod.SERVERLESS:
        return StreamFactory.launchServerlessStream(config);
      default:
        throw new Error(`Unsupported install method: ${config.installMethod}`);
    }
  }

  private static launchRemoteStream(config: PluginConfig) {
    const [host, port] = this.getRemoteHostAndPort(config);
    const tcp = new TCPReaderWriter({
      host,
      port,
      key: String(config.remoteInstallKey),
    });
    return { reader: tcp, writer: tcp };
  }

  private static launchServerlessStream(config: PluginConfig): StreamPair {
    const host = config.serverlessHost ?? '0.0.0.0';
    const port = config.serverlessPort ?? 8080;
    const writer = new ServerlessResponseWriter();
    return {
      reader: new ServerlessRequestReader("serverless", host, port, 300, writer),
      writer,
    };
  }

  private static getRemoteHostAndPort(config: PluginConfig): [string, number] {
    let rawHost: string;
    let rawPort: number;

    const installUrl = config.remoteInstallUrl;
    if (installUrl !== null && installUrl !== undefined && installUrl != '') {
      if (installUrl.includes(':')) {
        try {
          const hasProtocol = installUrl.includes('://');
          const url = new URL(hasProtocol ? installUrl : `http://${installUrl}`);
          if (url.hostname && url.port) {
            rawHost = url.hostname;
            rawPort = parseInt(url.port, 10);
          } else {
            const split = installUrl.split(':');
            rawHost = split[0]!;
            rawPort = parseInt(split[1]!, 10);
          }
        } catch {
          // 当 URL 解析失败时退回字符串切割逻辑
          const split = installUrl.split(':');
          rawHost = split[0]!;
          rawPort = parseInt(split[1]!, 10);
        }
      } else {
        throw new Error(
          `Invalid remote install URL ${installUrl}, which should be in the format of "host:port"`
        );
      }
    } else {
      rawHost = config.remoteInstallHost!;
      rawPort = typeof config.remoteInstallPort === 'string'
        ? parseInt(config.remoteInstallPort, 10)
        : config.remoteInstallPort!;
    }
    if (Number.isNaN(rawPort)) {
      throw new Error(`Invalid port specified in configuration or URL: ${installUrl ?? config.remoteInstallUrl}`);
    }

    // 3. 显式收窄与转换类型
    const host: string = String(rawHost);
    const port: number = typeof rawPort === 'number' ? rawPort : parseInt(String(rawPort), 10);

    return [host, port];
  }
}
