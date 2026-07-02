import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Node } from "../../types";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { getNodeTypeIconColor } from "../../utils/node";
import { useIfElseOperatorOptions } from "../if-else/hooks";
import { getFilterPrimaryBranch } from "./data";
import type { FilterNodeData } from "./types";
import { BranchItem, NodeHeader } from "../../components/nodes-shared";

const FilterNode = ({ id, data }: NodeProps<Node<FilterNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || "Filter";
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const updateNodeInternals = useUpdateNodeInternals();
  const { operatorOptionsByType } = useIfElseOperatorOptions();
  const branch = useMemo(() => getFilterPrimaryBranch(data.branches), [data.branches]);
  const conditions = branch.conditionGroup?.conditions ?? [];
  const logicLabel = branch.conditionGroup?.logicalOperator?.toUpperCase() ?? 'AND';
  const conditionPreview = conditions.slice(0, 3).map((condition) => {
    const type = condition.operator.leftType ?? 'string';
    const operator = operatorOptionsByType[type]?.find((item) => item.value === condition.operator.operator);
    const leftValue = String(condition.leftValue ?? t('workflow.conditions.selectVariable'));
    const rightValue = condition.operator.isUnary ? '' : String(condition.rightValue ?? '');

    return {
      id: condition.id,
      text: condition.operator.isUnary
        ? `${leftValue} ${operator?.label ?? condition.operator.operator}`
        : `${leftValue} ${operator?.label ?? condition.operator.operator} ${rightValue}`,
    };
  });

  useEffect(() => {
    updateNodeInternals(id);
  }, [conditions.length, id, updateNodeInternals]);

  return (
    <div className="if-else-node">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <BranchItem id={branch.id}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-[11px] font-semibold text-foreground">
                    {t('workflow.nodes.filter.name')}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {conditions.length === 0
                      ? t('workflow.conditions.noConditionsYet')
                      : t('workflow.conditions.conditionCount', { count: conditions.length })}
                  </span>
                  <span className="shrink-0 ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {logicLabel}
                  </span>
                </div>
                {conditionPreview.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {conditionPreview.map((preview) => (
                      <div key={preview.id} className="truncate text-[11px] text-muted-foreground">
                        {preview.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <NodeSourceHandle
                nodeId={id}
                handleId="output"
                className="top-1/2 !-right-[16px] left-full ml-1"
              />
            </BranchItem>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterNode;