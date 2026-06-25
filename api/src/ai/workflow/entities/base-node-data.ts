import { RetryConfig } from "../interfaces";
import { ErrorStrategy } from "../types/error-strategy.enum";
import { NodeType } from "../types/node-type.enum";

export abstract class BaseNodeData {
  label!: string;
  type!: NodeType;
  value?: string;
  description?: string;
  disabled?: boolean;

  errorStrategy?: ErrorStrategy;
  retryConfig?: RetryConfig;

  constructor(init?: Partial<BaseNodeData>) {
    Object.assign(this, init);
  }
}
