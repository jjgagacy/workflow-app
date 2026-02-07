import { StreamMessage } from "../../../core/dtos/stream.dto.js";
import { Plugin } from "../../../plugin.js";

class TelegraphMain extends Plugin {
  constructor() {
    super(__dirname)
  }

  protected isCPUTask(message: StreamMessage): boolean {
    return false;
  }
}

process.chdir(__dirname);
const telegraph = new TelegraphMain();
telegraph.run();
