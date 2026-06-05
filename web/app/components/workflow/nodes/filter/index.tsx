import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { Node } from "../../types";
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
      leftValue,
      operatorLabel: operator?.label ?? condition.operator.operator,
      rightValue,
      isUnary: Boolean(condition.operator.isUnary),
    };
  });

  useEffect(() => {
    updateNodeInternals(id);
  }, [conditions.length, id, updateNodeInternals]);

  return (
    <div className="filter-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <BranchItem id={branch.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-foreground">
                  {logicLabel}
                </span>
                <span className="text-xs text-muted-foreground">
                  {conditions.length === 0
                    ? t('workflow.conditions.noConditionsYet')
                    : t('workflow.conditions.conditionCount', { count: conditions.length })}
                </span>
              </div>
            </BranchItem>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default FilterNode;