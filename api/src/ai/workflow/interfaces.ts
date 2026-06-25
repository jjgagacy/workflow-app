
export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number; // in milliseconds
}

export interface WorkflowGraph {
  [key: string]: any;
}

export type OutputType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'
  | 'undefined';
