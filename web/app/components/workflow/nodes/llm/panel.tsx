import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import type { LLMNodeData } from "./types";
import { ExceptionSection } from "./components/exception-section";
import { InputVariableSection } from "./components/input-variable-section";
import { ModelSection } from "./components/model-section";
import { PanelHeader } from "./components/panel-header";
import { PromptSection } from "./components/prompt-section";
import { RetrySection } from "./components/retry-section";
import { VisionSection } from "./components/vision-section";

type LLMPanelProps = {
  node: Node<LLMNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const LLMPanel = ({ node }: LLMPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const modelId = node.data.modelId ?? '';
  const inputVariable = node.data.inputVariable ?? '';
  const systemPrompt = node.data.systemPrompt ?? '';
  const userPrompt = node.data.userPrompt ?? '';
  const assistantPrompt = node.data.assistantPrompt ?? '';
  const enableVision = Boolean(node.data.enableVision);
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(node.data.retryIntervalMs) || 0);
  const exceptionStrategy = node.data.exceptionStrategy || 'stop-execution';
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';

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
      currentValue: inputVariable,
      options: variableOptions,
    });
  }, [chatEnvVariables, envVariables, inputVariable, node.id, store, t]);

  const syncNodeData = (patch: Partial<LLMNodeData>) => {
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

  return (
    <div className="space-y-0">
      <PanelHeader label={node.data.label} />
      <ModelSection modelId={modelId} onChange={syncNodeData} />
      <InputVariableSection
        inputVariable={inputVariable}
        variableItems={variableItems}
        onChange={syncNodeData}
      />
      <PromptSection
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
        assistantPrompt={assistantPrompt}
        onChange={syncNodeData}
      />
      <VisionSection enableVision={enableVision} onChange={syncNodeData} />
      <RetrySection
        retryOnFailure={retryOnFailure}
        retryCount={retryCount}
        retryIntervalMs={retryIntervalMs}
        onChange={syncNodeData}
      />
      <ExceptionSection
        exceptionStrategy={exceptionStrategy}
        exceptionDefaultValue={exceptionDefaultValue}
        onChange={syncNodeData}
      />
    </div>
  );
};

export default LLMPanel;
