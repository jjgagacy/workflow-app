import { OutputType } from "../interfaces";

export class Output {
  type!: OutputType;

  children?: Record<string, Output> = {};
}

export interface Selector {
  nodeId: string;

  path: readonly string[];
}

export type VariableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>
  | VariableValue[];

