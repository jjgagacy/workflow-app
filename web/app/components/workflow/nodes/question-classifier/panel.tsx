import { useMemo } from "react";
import { CirclePlus, Trash2 } from "lucide-react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import {
  buildVariableSelectItems,
  buildWorkflowVariableOptions,
} from "../../components/nodes-shared/variable-select";
import {
  getWorkflowModelSelectItems,
  getWorkflowModelById,
} from "../../components/nodes-shared/model-options";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import type { Node } from "../../types";
import {
  createQuestionClassifierCategory,
  getQuestionClassifierCategoryDefaultName,
  normalizeQuestionClassifierCategories,
} from "./data";
import type { QuestionClassifierCategory, QuestionClassifierNodeData } from "./types";

type QuestionClassifierPanelProps = {
  node: Node<QuestionClassifierNodeData>;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';

const QuestionClassifierPanel = ({ node }: QuestionClassifierPanelProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { onNodeDataUpdate } = useNodesUpdate();

  const categories = normalizeQuestionClassifierCategories(node.data.categories);
  const inputVariable = String(node.data.inputVariable ?? '');
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
      categories: [...categories, createQuestionClassifierCategory(getQuestionClassifierCategoryDefaultName(nextIndex))],
    });
  };

  const removeCategory = (categoryId: string) => {
    const nextCategories = categories.filter((category) => category.id !== categoryId);
    syncNodeData({
      categories: nextCategories.length ? nextCategories : [createQuestionClassifierCategory('类别 1')],
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || 'Question Classifier'}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          使用大模型对输入问题进行分类，并将结果路由到对应类别分支。
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            {selectedModel ? `${selectedModel.provider} / ${selectedModel.name}` : '未选择模型'}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">类别 {categories.length}</span>
        </div>
      </div>

      <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">模型</div>
        <SimpleSelect
          items={modelItems}
          defaultValue={modelId}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ modelId: String(item.value) })}
        />
      </section>

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
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">分类列表</div>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            添加类别
          </button>
        </div>

        {categories.map((category, index) => {
          const name = category.name?.trim() || getQuestionClassifierCategoryDefaultName(index);

          return (
            <div key={category.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">类别 {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeCategory(category.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="删除类别"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">类别名称</div>
                  <input
                    value={category.name}
                    onChange={(event) => updateCategory(category.id, { name: event.target.value })}
                    placeholder={name}
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">分类提示词</div>
                  <Textarea
                    value={category.prompt}
                    onChange={(event) => updateCategory(category.id, { prompt: event.target.value })}
                    placeholder="输入该类别的分类提示词，例如：当用户问题包含退款、退货、取消订单相关意图时，归类到此类别。"
                    rows={3}
                    className="min-h-[88px]"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default QuestionClassifierPanel;
