import { BaseNodeData } from "../../entities/base-node-data";
import { Selector } from "../../entities/variables";
import { Output } from "../../entities/variables";
import { CodeLanguage } from "../../types/code-language.enum";

export class CodeNodeData extends BaseNodeData {
  codeLanguage!: CodeLanguage;
  code!: string;
  variables?: Selector[] = [];
  outputs: Record<string, Output> = {};
}
