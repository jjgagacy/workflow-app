import { RetryConfig, WorkflowGraph } from "../interfaces";
import { BaseNodeData } from "./base-node-data";
import { ErrorStrategy } from "../types/error-strategy.enum";
import { NodeType } from "../types/node-type.enum";
import { GraphRuntimeState } from "./graph-runtime-state";

export interface BaseNodeParams {
  id: string;
  nodeId: string;
  appId: string;
  tenantId: string;
  graphConfig: Record<string, any>;
  graph: WorkflowGraph;
  graphRuntimeState?: GraphRuntimeState;
}

export abstract class BaseNode<TNodeData extends BaseNodeData = BaseNodeData> {
  public id: string;
  public nodeId: string;
  public appId: string;
  public tenantId: string;
  public graphConfig: Record<string, any>;
  public graph: WorkflowGraph;
  public graphRuntimeState: GraphRuntimeState | null = null;

  protected abstract nodeType: NodeType;
  protected nodeData?: TNodeData;

  private nodeLabel = "";
  private nodeValue: unknown;
  private isDisabled = false;
  private strategy?: ErrorStrategy;
  private retry?: RetryConfig;
  private nodeDescription = "";

  constructor(init: BaseNodeParams) {
    this.id = init.id;
    this.nodeId = init.nodeId;
    this.appId = init.appId;
    this.tenantId = init.tenantId;
    this.graphConfig = init.graphConfig;
    this.graph = init.graph;
    this.graphRuntimeState = init.graphRuntimeState ?? null;
  }

  getNodeData(): TNodeData | undefined {
    return this.nodeData;
  }

  initNodeData(data: TNodeData): void {
    this.nodeData = data;
  }

  abstract run(): Promise<void>;

  label() {
    return this.nodeLabel;
  }

  value() {
    return this.nodeValue;
  }

  disabled() {
    return this.isDisabled;
  }

  errorStrategy() {
    return this.strategy;
  }

  retryConfig() {
    return this.retry;
  }

  description() {
    return this.nodeDescription;
  }
}
