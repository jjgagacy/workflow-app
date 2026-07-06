import type { HttpMethod, NodeData } from "../../types";

export type WebhookFieldItem = {
  id: string;
  name: string;
  required: boolean;
};

export type WebhookNodeData = NodeData<{
  httpMethod?: HttpMethod;
  path?: string;
  contentType?: string;

  statusCode?: number; // 成功默认：200
  responseBody?: string; // 默认：message: ok
  webhookUrl?: string;
  webhookTestUrl?: string;
  headers?: WebhookFieldItem[];
  params?: WebhookFieldItem[];
  body?: WebhookFieldItem[];
  isTest?: boolean;
  userId?: string;
}>;
