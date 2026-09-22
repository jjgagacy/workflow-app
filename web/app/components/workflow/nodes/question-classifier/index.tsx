import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { BranchItem, NodeHeader } from "../../components/nodes-shared";
import { getNodeTypeIcon } from "../../data";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { QuestionClassifierNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { useQuestionClassifier } from "./hooks";
import { useModelProviderContext } from "@/context/model-provider-context";
import { ModelIcon } from "../../components/model-picker/model-icon";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";

const QuestionClassifierNode = ({ id, data }: NodeProps<Node<QuestionClassifierNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.question-classifier.name');
  const iconColor = getNodeTypeIconColor(data.type);
  const updateNodeInternals = useUpdateNodeInternals();
  const { normalizeCategories, getDefaultCategoryName } = useQuestionClassifier();
  const { modelProviderModels } = useModelProviderContext();
  const locale = getLanguage(getClientLocale());

  const categories = useMemo(() => normalizeCategories(data.categories), [data.categories]);
  const currentProvider = modelProviderModels.find((item) => item.providerName === data.provider);
  const currentModel = currentProvider?.models.find((item) => item.model === data.modelId);
  const modelLabel = currentModel ? getLocalizedText(currentModel.label, locale) || currentModel.model : t('workflow.nodes.base.no-select-model');

  useEffect(() => {
    updateNodeInternals(id);
  }, [categories, id, updateNodeInternals]);

  return (
    <div className="question-classifier-node">
      <NodeHeader icon={getNodeTypeIcon(data.type, 'h-4 w-4')} iconColor={iconColor} title={label} />

      {!data._candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-1 text-xs">
              {currentProvider ? <ModelIcon small src={currentProvider} alt={currentProvider.providerName} /> : null}
              <span className="truncate text-foreground">{modelLabel}</span>
            </div>

            {categories.map((category, index) => {
              const categoryName = category.name?.trim() || getDefaultCategoryName(index);

              return (
                <BranchItem key={category.id} id={category.id}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-background pr-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-foreground">
                        {categoryName}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {category.prompt?.trim() || t('workflow.nodes.question-classifier.no-setting-category-prompt')}
                    </div>
                  </div>
                  <NodeSourceHandle
                    nodeId={id}
                    handleId={category.id}
                    className="top-1/2 -right-4 -translate-y-1/2"
                  />
                </BranchItem>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionClassifierNode;
