import type { NodeData, Variable, VariableType } from "../../types";

export type CodeInputParameter = Variable;

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
