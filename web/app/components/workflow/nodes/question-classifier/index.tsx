import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { BranchItem, NodeHeader } from "../../components/nodes-shared";
import { getWorkflowModelById } from "../../components/nodes-shared/model-options";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { QuestionClassifierNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { useQuestionClassifier } from "./hooks";

const QuestionClassifierNode = ({ id, data }: NodeProps<Node<QuestionClassifierNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.question-classifier.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const updateNodeInternals = useUpdateNodeInternals();
  const { normalizeCategories, getDefaultCategoryName } = useQuestionClassifier();

  const categories = useMemo(() => normalizeCategories(data.categories), [data.categories]);
  const model = getWorkflowModelById(data.modelId);
  const modelLabel = model ? `${model.provider} / ${model.name}` : t('workflow.nodes.base.no-select-model');

  useEffect(() => {
    updateNodeInternals(id);
  }, [categories, id, updateNodeInternals]);

  return (
    <div className="question-classifier-node">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />

      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-1 text-xs">
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
                    className="top-1/2 !-right-[16px] left-full ml-1"
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
