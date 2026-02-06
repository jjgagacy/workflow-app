import { Plugin, StreamMessage } from "monie-plugin";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
