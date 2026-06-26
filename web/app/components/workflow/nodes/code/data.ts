import type { NodeDefaultData } from "../../types";
import { CodeLanguage, ValueSourceMode, VariableDataType } from "../../types";
import type { CodeInputParameter, CodeNodeData, CodeOutputSchema, CodeOutputVariable } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;

export const createCodeInputParameter = (): CodeInputParameter => ({
  id: createId('code-input'),
  name: '',
  valueSource: 'input',
  sourceType: ValueSourceMode.variable,
});

export const createCodeOutputVariable = (): CodeOutputSchema => {
  const id = createId('code-output');
  return {
    result: {
      id,
      name: '',
      type: VariableDataType.any,
    },
  };
};

export const codeNodeDefaultData: NodeDefaultData<CodeNodeData> = {
  value: {
    inputs: [],
    outputs: {},
    code: '',
    language: CodeLanguage.javascript,

    retryOnFailure: false,
    retryCount: 1,
    exceptionStrategy: 'stop-execution',
    exceptionDefaultValue: '',
  },
};
