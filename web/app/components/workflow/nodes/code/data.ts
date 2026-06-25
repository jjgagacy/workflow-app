import type { NodeDefaultData } from "../../types";
import { ValueType, VariableType } from "../../types";
import type { CodeInputParameter, CodeNodeData, CodeOutputVariable } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const createCodeInputParameter = (): CodeInputParameter => ({
  id: createId('code-input'),
  name: '',
  valueSource: 'input',
  variableType: ValueType.variable,
});

export const createCodeOutputVariable = (): CodeOutputVariable => ({
  id: createId('code-output'),
  name: '',
  type: VariableType.any,
});

export const codeNodeDefaultData: NodeDefaultData<CodeNodeData> = {
  value: {
    inputParameters: [createCodeInputParameter()],
    outputVariables: [createCodeOutputVariable()],
    retryOnFailure: false,
    retryCount: 1,
    exceptionStrategy: 'stop-execution',
    exceptionDefaultValue: '',
    code: '',
  },
};
