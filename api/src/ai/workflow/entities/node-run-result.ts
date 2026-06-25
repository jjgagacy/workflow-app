import { NodeExecutionStatus } from "../types/node-execution";

export class NodeRunResult {
  constructor(
    public status: NodeExecutionStatus,
    public inputs: Record<string, any> = {},
    public outputs: Record<string, any> = {},
    public error?: string,
    public errorType?: string,
  ) { }

  static success(
    output: Record<string, any>,
    inputs?: Record<string, any>,
  ) {
    return new NodeRunResult(NodeExecutionStatus.SUCCESSED, inputs, output);
  }

  static failed(
    error: string,
    errorType?: string,
    inputs?: Record<string, any>,
  ) {
    return new NodeRunResult(NodeExecutionStatus.FAILED, inputs, {}, error, errorType);
  }

  static running(
    inputs?: Record<string, any>,
  ) {
    return new NodeRunResult(NodeExecutionStatus.RUNNING, inputs);
  }

  static pending(
    inputs?: Record<string, any>,
  ) {
    return new NodeRunResult(NodeExecutionStatus.PENDING, inputs);
  }

}