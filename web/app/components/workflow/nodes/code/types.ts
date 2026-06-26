import type { CodeLanguage, NodeData, Variable, VariableDataType } from "../../types";

export type CodeInputParameter = Variable;

export type CodeOutputVariable = {
  id: string;
  name: string;
  type: VariableDataType;
};

export type CodeOutputSchema = Record<string, CodeOutputVariable>;

export type CodeExceptionStrategy = 'stop-execution' | 'return-default';

export type CodeNodeData = NodeData<{
  inputs: CodeInputParameter[];
  outputs: CodeOutputSchema;
  language: CodeLanguage;
  code: string;

  retryOnFailure?: boolean;
  retryCount?: number;
  exceptionStrategy?: CodeExceptionStrategy;
  exceptionDefaultValue?: string;
}>;
