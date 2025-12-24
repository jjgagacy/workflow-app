import { StreamMessage } from "@/core/dtos/stream.dto";
import { Plugin } from "@/plugin";

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
