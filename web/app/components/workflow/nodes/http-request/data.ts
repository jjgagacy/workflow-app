import type { NodeDefaultData } from "../../types";
import type { HttpKeyValueItem, HttpRequestNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const createHttpKeyValueItem = (): HttpKeyValueItem => ({
  id: createId('http-kv'),
  key: '',
  value: '',
});

export const httpRequestNodeDefaultData: NodeDefaultData<HttpRequestNodeData> = {
  value: {
    url: '',
    method: 'GET',
    headers: [createHttpKeyValueItem()],
    params: [createHttpKeyValueItem()],
    bodyType: 'none',
    bodyFormData: [createHttpKeyValueItem()],
    bodyUrlEncoded: [createHttpKeyValueItem()],
    bodyJson: '',
    bodyRaw: '',
    bodyBinaryVariable: '',
    timeoutConnectMs: 5000,
    timeoutReadMs: 15000,
    timeoutWriteMs: 15000,
    retryOnFailure: false,
    retryCount: 1,
    retryIntervalMs: 1000,
    exceptionStrategy: 'stop-execution',
    exceptionDefaultValue: '',
    outputVariableName: 'httpResponse',
  },
};
