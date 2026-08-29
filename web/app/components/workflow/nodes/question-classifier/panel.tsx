import { useMemo } from "react";
import { CirclePlus } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { VarPicker } from "../../components/variable/var-picker";
import {
  getWorkflowModelSelectItems,
  getWorkflowModelById,
} from "../../components/nodes-shared/model-options";
import { useWorkflowStore } from "../../context";
import { useNodeConfig } from "../../hooks/use-node-config";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node, Variable, VariableSelector } from "../../types";
import ClassifierList from "./list";
import type { QuestionClassifierCategory, QuestionClassifierNodeData } from "./types";
import { useQuestionClassifier } from "./hooks";

type QuestionClassifierPanelProps = {
  node: Node<QuestionClassifierNodeData>;
};

const QuestionClassifierPanel = ({ node }: QuestionClassifierPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { availableNodes, nodeVariableList } = useNodeConfig(node.id);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { createCategory, normalizeCategories, getDefaultCategoryName } = useQuestionClassifier();

  const categories = normalizeCategories(node.data.categories);
  const inputVariable = node.data.inputVariable;
  const modelId = node.data.modelId ?? '';
  const modelItems = getWorkflowModelSelectItems();
  const selectedModel = getWorkflowModelById(modelId);

  const syncNodeData = (patch: Partial<QuestionClassifierNodeData>) => {
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

  const updateCategory = (categoryId: string, patch: Partial<QuestionClassifierCategory>) => {
    const nextCategories = categories.map((category) => {
      if (category.id !== categoryId) {
        return category;
      }

      return {
        ...category,
        ...patch,
      };
    });

    syncNodeData({ categories: nextCategories });
  };

  const addCategory = () => {
    const nextIndex = categories.length;
    syncNodeData({
      categories: [...categories, createCategory(getDefaultCategoryName(nextIndex))],
    });
  };

  const removeCategory = (categoryId: string) => {
    const nextCategories = categories.filter((category) => category.id !== categoryId);
    syncNodeData({
      categories: nextCategories.length ? nextCategories : [createCategory(getDefaultCategoryName(0))],
    });
  };

  const handleInputVariableChange = (_variable: Variable, selector: VariableSelector) => {
    syncNodeData({ inputVariable: selector });
  };

  return (
    <div className="space-y-0">
      <div className="rounded-lg bg-muted/20 px-4 py-4">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || t('workflow.nodes.question-classifier.name')}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.question-classifier.description2')}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            {selectedModel ? `${selectedModel.provider} / ${selectedModel.name}` : t('workflow.nodes.base.no-select-model')}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">{t('workflow.nodes.question-classifier.category-count', { count: categories.length })}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-1">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.base.llm-select-label')}</div>
        <SimpleSelect
          items={modelItems}
          defaultValue={modelId}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ modelId: String(item.value) })}
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.base.input-variable-label')}</div>
        <VarPicker
          nodeId={node.id}
          value={inputVariable}
          onChange={handleInputVariableChange}
          availableNodes={availableNodes}
          nodeOutputVariables={nodeVariableList}
          className="w-full"
        />
      </section>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.nodes.question-classifier.category-list')}</div>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            {t('workflow.nodes.question-classifier.add-category')}
          </button>
        </div>

        <ClassifierList
          categories={categories}
          onUpdateCategory={updateCategory}
          onRemoveCategory={removeCategory}
        />
      </section>
    </div>
  );
};

export default QuestionClassifierPanel;
