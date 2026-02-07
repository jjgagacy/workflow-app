import { InstallMethod } from "../config/config.enum.js";
import { StreamPair } from "./streams/stream.js";
import { StdioReader } from "../server/stdio/stdio-reader.class.js";
import { StdioWriter } from "../server/stdio/stdio-writer.class.js";

export class StreamFactory {
  static create(config: { installMethod: InstallMethod }): StreamPair {
    switch (config.installMethod) {
      case InstallMethod.LOCAL:
        // return new LocalStream();
        return { reader: new StdioReader(), writer: new StdioWriter() };
        break;
      case InstallMethod.REMOTE:
        // return new RemoteStream();
        break;
      case InstallMethod.SERVERLESS:
        // return new ServerlessStream();
        break;
    }
    throw new Error("Method not implemented.");
  }
}
