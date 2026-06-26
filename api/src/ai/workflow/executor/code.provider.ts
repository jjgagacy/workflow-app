import { NodeType } from "../types/node-type.enum";
import { createId } from "./utils";

export interface CodeProviderSignature {
  getLanguage(): string;
  getDefaultCode(): string;
  getDefaultConfig(): Record<string, any> | null;
}

export abstract class CodeProvider {
  static getDefaultConfig(): Record<string, any> | null {
    const cls = this as any;
    return {
      type: 'code',
      config: {
        inputs: [
          { id: createId('arg1'), name: 'arg1', valueSelector: [] },
          { id: createId('arg2'), name: 'arg2', valueSelector: [] },
        ],
        outputs: {
          result: { id: createId('result'), name: 'result', type: "string" },
        },
        code: cls.getDefaultCode(),
        language: cls.getLanguage(),
      },
    };
  }

  static getDefaultCode(): string {
    return '';
  }

  static getLanguage(): string {
    return '';
  }

  static getNodeType(): string {
    return NodeType.Code;
  }
}
