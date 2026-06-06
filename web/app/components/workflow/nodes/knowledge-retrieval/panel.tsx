import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import {
  buildVariableSelectItems,
  buildWorkflowVariableOptions,
} from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import {
  createKnowledgeBaseSelection,
  KNOWLEDGE_BASE_OPTIONS,
  normalizeKnowledgeBaseSelections,
} from "./data";
import type { KnowledgeBaseSelection, KnowledgeRetrievalNodeData } from "./types";

type KnowledgeRetrievalPanelProps = {
  node: Node<KnowledgeRetrievalNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const KnowledgeRetrievalPanel = ({ node }: KnowledgeRetrievalPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const inputVariable = node.data.inputVariable ?? '';
  const knowledgeBases = normalizeKnowledgeBaseSelections(node.data.knowledgeBases);
  const outputVariableName = node.data.outputVariableName ?? 'knowledgeResults';

  const syncNodeData = (patch: Partial<KnowledgeRetrievalNodeData>) => {
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

  const knowledgeBaseItems: SelectItem[] = KNOWLEDGE_BASE_OPTIONS.map((option) => ({
    value: option.id,
    name: option.name,
    description: option.description,
  }));

  const upsertKnowledgeBase = (selectionId: string, patch: Partial<KnowledgeBaseSelection>) => {
    const nextKnowledgeBases = knowledgeBases.map((item) => {
      if (item.id !== selectionId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    syncNodeData({ knowledgeBases: nextKnowledgeBases });
  };

  const addKnowledgeBase = () => {
    syncNodeData({ knowledgeBases: [...knowledgeBases, createKnowledgeBaseSelection()] });
  };

  const removeKnowledgeBase = (selectionId: string) => {
    const nextKnowledgeBases = knowledgeBases.filter((item) => item.id !== selectionId);
    syncNodeData({
      knowledgeBases: nextKnowledgeBases.length ? nextKnowledgeBases : [createKnowledgeBaseSelection()],
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Knowledge Retrieval'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          从一个或多个知识库检索相关内容，输出检索结果供后续节点使用。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">输入 {inputVariable || '未选择'}</span>
          <span className="rounded-full bg-background px-2.5 py-1">知识库 {knowledgeBases.length}</span>
          <span className="rounded-full bg-background px-2.5 py-1">输出 {outputVariableName}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
        <SimpleSelect
          items={variableItems}
          defaultValue={inputVariable}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ inputVariable: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">知识库列表</div>
          <button
            type="button"
            onClick={addKnowledgeBase}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加知识库
          </button>
        </div>

        <div className="space-y-2">
          {knowledgeBases.map((selection, index) => (
            <div key={selection.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">知识库 {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeKnowledgeBase(selection.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="删除知识库"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <SimpleSelect
                items={knowledgeBaseItems}
                defaultValue={selection.knowledgeBaseId}
                allowSearch={false}
                className="w-full"
                onSelect={(item) => upsertKnowledgeBase(selection.id, { knowledgeBaseId: String(item.value) })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量名</div>
          <input
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder="例如: knowledgeResults"
            className={inputClassName}
          />
        </label>
      </section>
    </div>
  );
};

export default KnowledgeRetrievalPanel;
