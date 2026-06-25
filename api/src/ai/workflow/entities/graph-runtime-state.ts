import { VariablePool } from "./variable-pool";
import { NodeRunResult } from "./node-run-result";

export class GraphRuntimeState {
  constructor(
    readonly variables: VariablePool,
    readonly executionResults = new Map<string, NodeRunResult>(),
  ) { }
}
