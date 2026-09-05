import { Plugin, StreamMessage } from "monie-plugin";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GeminiMain extends Plugin {
  constructor() {
    super(__dirname);
  }

  protected isCPUTask(message: StreamMessage): boolean {
    return false;
  }
}

process.chdir(__dirname);
const gemini = new GeminiMain();
gemini.run();
