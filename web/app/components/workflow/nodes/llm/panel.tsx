import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../../context";
import { useNodeConfig } from "../../hooks/use-node-config";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node, VariableSelector } from "../../types";
import type { LLMNodeData } from "./types";
import { ExceptionSection } from "./components/exception-section";
import { InputVariableSection } from "./components/input-variable-section";
import { ModelSection } from "./components/model-section";
import { OutputVariableSection } from "./components/output-variable-section";
import { PanelHeader } from "./components/panel-header";
import { PromptSection } from "./components/prompt-section";
import { RetrySection } from "./components/retry-section";
import { VisionSection } from "./components/vision-section";

type LLMPanelProps = {
  node: Node<LLMNodeData>;
};

const LLMPanel = ({ node }: LLMPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { availableNodes, nodeVariableList } = useNodeConfig(node.id);
  const { onNodeDataUpdate } = useNodesUpdate();

  const modelId = node.data.modelId ?? '';
  const provider = node.data.provider ?? '';
  const inputVariable = node.data.inputVariable;
  const systemPrompt = node.data.systemPrompt ?? '';
  const userPrompt = node.data.userPrompt ?? '';
  const assistantPrompt = node.data.assistantPrompt ?? '';
  const enableVision = Boolean(node.data.enableVision);
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const retryIntervalMs = Math.max(0, Number(node.data.retryIntervalMs) || 0);
  const exceptionStrategy = node.data.exceptionStrategy || 'stop-execution';
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';
  const outputVariableName = node.data.outputVariableName || 'result';
  const outputFields = [
    { name: 'text', description: t('workflow.nodes.llm.outputFieldText') },
    { name: '_usage', description: t('workflow.nodes.llm.outputFieldUsage') },
  ];

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
      <ModelSection modelId={modelId} provider={provider} onChange={syncNodeData} />
      <InputVariableSection
        nodeId={node.id}
        inputVariable={inputVariable}
        availableNodes={availableNodes}
        nodeOutputVariables={nodeVariableList}
        onChange={(selector: VariableSelector) => syncNodeData({ inputVariable: selector })}
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
      <OutputVariableSection outputVariableName={outputVariableName} outputFields={outputFields} />
    </div>
  );
};

export default LLMPanel;
