import { BaseNode } from "../../entities/base-node.class";
import { getCodeProviderClass } from "../../executor/utils";
import { CodeLanguage } from "../../types/code-language.enum";
import { NodeType } from "../../types/node-type.enum";
import { CodeNodeData } from "./code-node.data";

export class CodeNode extends BaseNode<CodeNodeData> {
  protected nodeType: NodeType = NodeType.Code;

  async run(): Promise<void> {
    if (this.disabled()) {
      return;
    }
    // Execute node logic here
  }

  static version(): string {
    return "1";
  }

  static getDefaultConfig(filters?: Record<string, any>): Record<string, any> {
    const language = filters?.language ? filters.language.toLowerCase() : CodeLanguage.JavaScript;
    const codeProviderClass = getCodeProviderClass(language);
    if (!codeProviderClass) {
      return {};
    }
    return codeProviderClass.getDefaultConfig();
  }
}
