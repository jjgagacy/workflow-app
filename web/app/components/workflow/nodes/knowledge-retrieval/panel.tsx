import { useMemo } from "react";
import { CirclePlus } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import DeleteButton from "../../components/base/delete-button";
import { NodeInput } from "../../components/base/node-input";
import {
  buildVariableSelectItems,
  buildWorkflowVariableOptions,
} from "../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import type { KnowledgeBaseSelection, KnowledgeRetrievalNodeData } from "./types";
import { useKnowledgeRetrieval } from "./hooks";
import { DEFAULT_OUTPUT_VARIABLE_NAME } from "../document-extractor/data";

type KnowledgeRetrievalPanelProps = {
  node: Node<KnowledgeRetrievalNodeData>;
};

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const KnowledgeRetrievalPanel = ({ node }: KnowledgeRetrievalPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { normalizeKnowledgeBaseSelections, createKnowledgeBaseSelection, knowledgeBaseOptions } = useKnowledgeRetrieval();

  const inputVariable = node.data.inputVariable ?? '';
  const knowledgeBases = normalizeKnowledgeBaseSelections(node.data.knowledgeBases);
  const outputVariableName = node.data.outputVariableName ?? DEFAULT_OUTPUT_VARIABLE_NAME;

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

  const knowledgeBaseItems: SelectItem[] = knowledgeBaseOptions.map((option) => ({
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
    <div className="space-y-0">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || t('workflow.nodes.knowledge-retrieval.name')}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.knowledge-retrieval.description2')}
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.knowledge-retrieval.input')}</div>
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
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.knowledge-retrieval.knowledgeBases')}</div>
          <button
            type="button"
            onClick={addKnowledgeBase}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            {t('workflow.nodes.knowledge-retrieval.addKnowledgeBase')}
          </button>
        </div>

        <div className="space-y-2">
          {knowledgeBases.map((selection, index) => (
            <div key={selection.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.knowledge-retrieval.knowledgeBase')} {index + 1}</div>
                <DeleteButton
                  onClick={() => removeKnowledgeBase(selection.id)}
                  ariaLabel={t('workflow.nodes.knowledge-retrieval.removeKnowledgeBase')}
                />
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
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.knowledge-retrieval.outputVariableName')}</div>
          <NodeInput
            value={outputVariableName}
            onChange={(event) => syncNodeData({ outputVariableName: event.target.value })}
            placeholder="text"
          />
        </label>
      </section>
    </div>
  );
};

export default KnowledgeRetrievalPanel;
