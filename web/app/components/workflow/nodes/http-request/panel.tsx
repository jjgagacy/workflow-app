import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import {
  ExceptionSection,
  KeyValueEditor,
  OutputSection,
  RequestBodySection,
  RequestConfigSection,
  RetrySection,
  SummaryCard,
  TimeoutSection,
} from "./components";
import { createHttpKeyValueItem, DEFAULT_HTTP_RESPONSE_VARIABLE_NAME } from "./data";
import { useHttpRequestSelectItems } from "./hooks";
import type {
  HttpExceptionStrategy,
  HttpKeyValueItem,
  HttpRequestNodeData,
} from "./types";
import type { HttpBodyType } from "../../types";
import type { HttpMethod } from "../../types";

type HttpRequestPanelProps = {
  node: Node<HttpRequestNodeData>;
};

type KeyValueField = 'headers' | 'params' | 'bodyFormData' | 'bodyUrlEncoded';

const HttpRequestPanel = ({ node }: HttpRequestPanelProps) => {
  const { t } = useTranslation();
  const {
    methodItems,
    bodyTypeItems,
    exceptionStrategyItems,
  } = useHttpRequestSelectItems();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const url = node.data.url ?? '';
  const method = (node.data.method ?? 'GET') as HttpMethod;
  const headers = node.data.headers ?? [createHttpKeyValueItem()];
  const params = node.data.params ?? [createHttpKeyValueItem()];
  const bodyType = (node.data.bodyType ?? 'none') as HttpBodyType;
  const bodyFormData = node.data.bodyFormData ?? [createHttpKeyValueItem()];
  const bodyUrlEncoded = node.data.bodyUrlEncoded ?? [createHttpKeyValueItem()];
  const bodyJson = node.data.bodyJson ?? '';
  const bodyRaw = node.data.bodyRaw ?? '';
  const bodyBinaryVariable = node.data.bodyBinaryVariable ?? '';
  const timeoutConnectMs = Math.max(0, Number(node.data.timeoutConnectMs) || 0);
  const timeoutReadMs = Math.max(0, Number(node.data.timeoutReadMs) || 0);
  const timeoutWriteMs = Math.max(0, Number(node.data.timeoutWriteMs) || 0);
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(node.data.retryIntervalMs) || 0);
  const exceptionStrategy = (node.data.exceptionStrategy ?? 'stop-execution') as HttpExceptionStrategy;
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';
  const outputVariableName = node.data.outputVariableName ?? DEFAULT_HTTP_RESPONSE_VARIABLE_NAME;

  const syncNodeData = (patch: Partial<HttpRequestNodeData>) => {
    const nextNode = {
      ...node,
      data: {
        ...node.data,
        ...patch,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: patch,
    });
  };

  const updateKeyValueItems = (field: KeyValueField, nextItems: HttpKeyValueItem[]) => {
    syncNodeData({ [field]: nextItems } as Partial<HttpRequestNodeData>);
  };

  const upsertKeyValue = (field: KeyValueField, itemId: string, patch: Partial<HttpKeyValueItem>) => {
    const currentItems = (node.data[field] as HttpKeyValueItem[] | undefined) ?? [createHttpKeyValueItem()];
    const nextItems = currentItems.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    updateKeyValueItems(field, nextItems);
  };

  const addKeyValue = (field: KeyValueField) => {
    const currentItems = (node.data[field] as HttpKeyValueItem[] | undefined) ?? [createHttpKeyValueItem()];
    updateKeyValueItems(field, [...currentItems, createHttpKeyValueItem()]);
  };

  const removeKeyValue = (field: KeyValueField, itemId: string) => {
    const currentItems = (node.data[field] as HttpKeyValueItem[] | undefined) ?? [createHttpKeyValueItem()];
    const nextItems = currentItems.filter((item) => item.id !== itemId);
    updateKeyValueItems(field, nextItems.length ? nextItems : [createHttpKeyValueItem()]);
  };

  const variableItems = useMemo(() => {
    const nodes = store.getState().nodes as Node[];
    const variableOptions = buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });

    return buildVariableSelectItems({
      t,
      currentValue: bodyBinaryVariable,
      options: variableOptions,
    });
  }, [bodyBinaryVariable, chatEnvVariables, envVariables, node.id, store, t]);

  return (
    <div className="space-y-4">
      <SummaryCard
        label={node.data.label}
        method={method}
        bodyType={bodyType}
        outputVariableName={outputVariableName}
      />

      <RequestConfigSection
        url={url}
        method={method}
        methodItems={methodItems}
        onUrlChange={(value) => syncNodeData({ url: value })}
        onMethodChange={(value) => syncNodeData({ method: value })}
      />

      <KeyValueEditor
        title={t('workflow.nodes.http-request.headers')}
        addLabel={t('workflow.nodes.http-request.addHeader')}
        items={headers}
        onAdd={() => addKeyValue('headers')}
        onRemove={(id) => removeKeyValue('headers', id)}
        onChange={(id, patch) => upsertKeyValue('headers', id, patch)}
      />

      <KeyValueEditor
        title={t('workflow.nodes.http-request.params')}
        addLabel={t('workflow.nodes.http-request.addParam')}
        items={params}
        onAdd={() => addKeyValue('params')}
        onRemove={(id) => removeKeyValue('params', id)}
        onChange={(id, patch) => upsertKeyValue('params', id, patch)}
      />

      <RequestBodySection
        bodyType={bodyType}
        bodyTypeItems={bodyTypeItems}
        bodyFormData={bodyFormData}
        bodyUrlEncoded={bodyUrlEncoded}
        bodyJson={bodyJson}
        bodyRaw={bodyRaw}
        bodyBinaryVariable={bodyBinaryVariable}
        variableItems={variableItems}
        onBodyTypeChange={(value) => syncNodeData({ bodyType: value })}
        onBodyJsonChange={(value) => syncNodeData({ bodyJson: value })}
        onBodyRawChange={(value) => syncNodeData({ bodyRaw: value })}
        onBodyBinaryVariableChange={(value) => syncNodeData({ bodyBinaryVariable: value })}
        onAddFormData={() => addKeyValue('bodyFormData')}
        onRemoveFormData={(id) => removeKeyValue('bodyFormData', id)}
        onChangeFormData={(id, patch) => upsertKeyValue('bodyFormData', id, patch)}
        onAddUrlEncoded={() => addKeyValue('bodyUrlEncoded')}
        onRemoveUrlEncoded={(id) => removeKeyValue('bodyUrlEncoded', id)}
        onChangeUrlEncoded={(id, patch) => upsertKeyValue('bodyUrlEncoded', id, patch)}
      />

      <TimeoutSection
        timeoutConnectMs={timeoutConnectMs}
        timeoutReadMs={timeoutReadMs}
        timeoutWriteMs={timeoutWriteMs}
        onTimeoutConnectChange={(value) => syncNodeData({ timeoutConnectMs: value })}
        onTimeoutReadChange={(value) => syncNodeData({ timeoutReadMs: value })}
        onTimeoutWriteChange={(value) => syncNodeData({ timeoutWriteMs: value })}
      />

      <RetrySection
        retryOnFailure={retryOnFailure}
        retryCount={retryCount}
        retryIntervalMs={retryIntervalMs}
        onRetryToggle={(checked) => syncNodeData({ retryOnFailure: checked })}
        onRetryCountChange={(value) => syncNodeData({ retryCount: value })}
        onRetryIntervalChange={(value) => syncNodeData({ retryIntervalMs: value })}
      />

      <ExceptionSection
        exceptionStrategy={exceptionStrategy}
        exceptionStrategyItems={exceptionStrategyItems}
        exceptionDefaultValue={exceptionDefaultValue}
        onExceptionStrategyChange={(value) => syncNodeData({ exceptionStrategy: value })}
        onExceptionDefaultValueChange={(value) => syncNodeData({ exceptionDefaultValue: value })}
      />

      <OutputSection
        outputVariableName={outputVariableName}
        onOutputVariableNameChange={(value) => syncNodeData({ outputVariableName: value })}
      />
    </div>
  );
};

export default HttpRequestPanel;
