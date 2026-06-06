import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { BranchItem, NodeHeader } from "../../components/nodes-shared";
import { getWorkflowModelById } from "../../components/nodes-shared/model-options";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import {
  getQuestionClassifierCategoryDefaultName,
  normalizeQuestionClassifierCategories,
} from "./data";
import type { QuestionClassifierNodeData } from "./types";

const QuestionClassifierNode = ({ id, data }: NodeProps<Node<QuestionClassifierNodeData>>) => {
  const label = data.label?.trim() || 'Question Classifier';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const updateNodeInternals = useUpdateNodeInternals();
  const categories = useMemo(() => normalizeQuestionClassifierCategories(data.categories), [data.categories]);
  const model = getWorkflowModelById(data.modelId);
  const modelLabel = model ? `${model.provider} / ${model.name}` : '未选择模型';

  useEffect(() => {
    updateNodeInternals(id);
  }, [categories, id, updateNodeInternals]);

  return (
    <div className="question-classifier-node">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-background px-2.5 py-1">{modelLabel}</span>
            </div>

            {categories.map((category, index) => {
              const categoryName = category.name?.trim() || getQuestionClassifierCategoryDefaultName(index);

              return (
                <BranchItem key={category.id} id={category.id}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-background pr-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-foreground">
                        {categoryName}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {category.prompt?.trim() || '未设置分类提示词'}
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
