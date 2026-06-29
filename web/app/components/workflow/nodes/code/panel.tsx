import { useMemo, useRef } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { buildWorkflowVariableOptions } from "../../components/nodes-shared/variable-select";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { CodeLanguage, Node } from "../../types";
import { createCodeInputParameter } from "./data";
import type {
  CodeInputParameter,
  CodeNodeData,
} from "./types";
import { CodeEditor } from "../../components/code-editor";
import { useConfig } from "./hooks/use-config";
import { VarList } from "../../components/variable/var-list";
import { RetryConfig } from "../../components/retry/retry-config";
import { ExceptionHandler } from "../../components/exception-handler/exception-handler";
import { SimpleSelect } from "@/app/ui/select";
import { codeLanguageOptions } from "../../components/code-editor/types";

type CodePanelProps = {
  node: Node<CodeNodeData>;
};


const CodePanel = ({ node }: CodePanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { handleLanguageChange } = useConfig(node.id, node.data);
  const panelRef = useRef<HTMLDivElement>(null);

  const syncNodeData = (patch: Partial<CodeNodeData>) => {
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

  const nodeData = node.data;
  // console.log('nodeData:', nodeData);

  const inputParameters = node.data.inputs ?? [];
  const outputVariables = node.data.outputs ?? [];
  const retryOnFailure = Boolean(node.data.retryOnFailure);
  const retryCount = Math.max(1, Number(node.data.retryCount) || 1);
  const exceptionStrategy = node.data.exceptionStrategy || 'stop-execution';
  const exceptionDefaultValue = node.data.exceptionDefaultValue ?? '';

  const variableOptions = useMemo(() => {
    const nodes = store.getState().nodes as Node[];

    return buildWorkflowVariableOptions({
      t,
      nodeId: node.id,
      nodes,
      envVariables,
      chatEnvVariables,
    });
  }, [chatEnvVariables, envVariables, node.id, store, t]);

  const upsertInputParameter = (parameterId: string, patch: Partial<CodeInputParameter>) => {
    const nextInputParameters = inputParameters.map((item) => {
      if (item.id !== parameterId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    syncNodeData({ inputs: nextInputParameters });
  };

  const removeInputParameter = (parameterId: string) => {
    const nextInputParameters = inputParameters.filter((item) => item.id !== parameterId);
    syncNodeData({ inputs: nextInputParameters });
  };

  const addInputParameter = () => {
    syncNodeData({
      inputs: [...inputParameters, createCodeInputParameter()],
    });
  };

  return (
    <div className="space-y-4" ref={panelRef}>
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Code'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          管理输入变量映射、输出变量定义，以及代码异常处理策略。
        </div>
      </div>

      <VarList
        node={node}
        inputParameters={inputParameters}
        variableOptions={variableOptions}
        onUpsertInputParameter={upsertInputParameter}
        onRemoveInputParameter={removeInputParameter}
        onAddInputParameter={addInputParameter}
      />

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">代码</div>
        <CodeEditor
          language={CodeLanguage.javascript}
          title={
            <div className="flex items-center justify-between gap-2">
              <SimpleSelect
                defaultValue={(nodeData.language || CodeLanguage.javascript) as string}
                items={codeLanguageOptions}
                onSelect={(item) => handleLanguageChange(item.value as CodeLanguage)}
                byClassName="border-0"
              />
            </div>
          }
          value={nodeData.code || ''}
          onChange={(value) => syncNodeData({ code: value })}
        />
      </section>

      <RetryConfig
        retryOnFailure={retryOnFailure}
        retryCount={retryCount}
        onRetryConfigChange={syncNodeData}
      />
      <ExceptionHandler
        exceptionStrategy={exceptionStrategy}
        exceptionDefaultValue={exceptionDefaultValue}
        onExceptionConfigChange={syncNodeData}
      />
    </div>
  );
};

export default CodePanel;
