import type { HttpBodyType, HttpMethod, NodeData } from "../../types";

export type HttpKeyValueItem = {
  id: string;
  key: string;
  value: string;
};

export type HttpExceptionStrategy = 'stop-execution' | 'return-default';

export type HttpRequestNodeData = NodeData<{
  url?: string;
  method?: HttpMethod;
  headers?: HttpKeyValueItem[];
  params?: HttpKeyValueItem[];
  bodyType?: HttpBodyType;
  bodyFormData?: HttpKeyValueItem[];
  bodyUrlEncoded?: HttpKeyValueItem[];
  bodyJson?: string;
  bodyRaw?: string;
  bodyBinaryVariable?: string;
  timeoutConnectMs?: number;
  timeoutReadMs?: number;
  timeoutWriteMs?: number;
  retryOnFailure?: boolean;
  retryCount?: number;
  retryIntervalMs?: number;
  exceptionStrategy?: HttpExceptionStrategy;
  exceptionDefaultValue?: string;
  outputVariableName?: string;
}>;
