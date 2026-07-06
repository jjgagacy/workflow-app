import type { NodeDefaultData } from "../../types";
import type { WebhookFieldItem, WebhookNodeData } from "./type";
import { BASE_URL } from "@/config";

type FetchWebhookPathParams = {
  nodeId: string;
  userId?: string;
};

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

export const normalizeWebhookPath = (path?: string) => {
  const normalized = (path ?? '').trim().replace(/^\/+/, '').replace(/\s+/g, '-');
  return normalized;
};

export const buildWebhookUrls = (baseUrl: string, path?: string) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const normalizedPath = normalizeWebhookPath(path);
  const pathSuffix = normalizedPath ? `/${normalizedPath}` : '';

  return {
    webhookUrl: `${normalizedBaseUrl}/webhook${pathSuffix}`,
    webhookTestUrl: `${normalizedBaseUrl}/webhook_test${pathSuffix}`,
  };
};

export const createWebhookFieldItem = (): WebhookFieldItem => ({
  id: createId('webhook-field'),
  name: '',
  required: false,
});

export const normalizeWebhookFieldItems = (items?: WebhookFieldItem[]) => {
  if (!items || !items.length) {
    return [createWebhookFieldItem()];
  }

  return items.map((item) => ({
    ...item,
    id: item.id || createId('webhook-field'),
    name: item.name ?? '',
    required: Boolean(item.required),
  }));
};

export const fetchWebhookPath = async ({ nodeId }: FetchWebhookPathParams) => {
  // TODO: Replace this placeholder with the real API call once endpoint is ready.
  const normalizedNodeId = nodeId.trim().replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `hook-${normalizedNodeId || Date.now().toString(36)}`;
};

const defaultUrls = buildWebhookUrls(BASE_URL, '');

export const webhookNodeDefaultData: NodeDefaultData<WebhookNodeData> = ({
  value: {
    httpMethod: 'POST',
    path: '',
    contentType: 'application/json',
    statusCode: 200,
    responseBody: 'ok',
    webhookUrl: defaultUrls.webhookUrl,
    webhookTestUrl: defaultUrls.webhookTestUrl,
    headers: [createWebhookFieldItem()],
    params: [createWebhookFieldItem()],
    body: [createWebhookFieldItem()],
  }
});