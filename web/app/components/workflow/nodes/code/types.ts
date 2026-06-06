import type { NodeData, VariableType } from "../../types";

export type CodeInputValueSourceType = 'input' | 'env' | 'session' | 'node-output' | 'system';

export type CodeInputParameter = {
  id: string;
  name: string;
  valueSourceType?: CodeInputValueSourceType;
  valueSource: string;
};

export type CodeOutputVariable = {
  id: string;
  name: string;
  type: VariableType;
};

export type CodeExceptionStrategy = 'stop-execution' | 'return-default';

export type CodeNodeData = NodeData<{
  inputParameters?: CodeInputParameter[];
  outputVariables?: CodeOutputVariable[];
  retryOnFailure?: boolean;
  retryCount?: number;
  exceptionStrategy?: CodeExceptionStrategy;
  exceptionDefaultValue?: string;
  code?: string;
}>;
