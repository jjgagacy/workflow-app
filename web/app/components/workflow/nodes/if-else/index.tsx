import { NodeProps, useUpdateNodeInternals } from "@xyflow/react";
import { IfElseNodeData } from "./types";
import { Node } from "../../types";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { getNodeTypeIconColor } from "../../utils/node";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getIfElseBranchDefaultName, normalizeIfElseBranches } from "./data";
import { BranchItem, NodeHeader } from "../../components/nodes-shared";

const IfElseNode = ({ id, data }: NodeProps<Node<IfElseNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || "If-Else";
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const updateNodeInternals = useUpdateNodeInternals();
  const branches = useMemo(() => normalizeIfElseBranches(data.branches), [data.branches]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [branches, id, updateNodeInternals]);

  return (
    <div className="if-else-node">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            {branches.map((branch, index) => {
              const isDefault = Boolean(branch.isDefault);
              const conditionCount = branch.conditionGroup?.conditions?.length ?? 0;
              const conditionSummary = conditionCount === 0
                ? t('workflow.conditions.noConditionsYet')
                : t('workflow.conditions.conditionCount', { count: conditionCount });
              const branchTitle = branch.name?.trim() || getIfElseBranchDefaultName(index, isDefault);
              const logicLabel = branch.conditionGroup.logicalOperator.toUpperCase();

              return (
                <BranchItem key={branch.id} id={branch.id}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-background pr-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-foreground">
                        {branchTitle}
                      </span>
                      {!isDefault && (
                        <span className="text-xs text-muted-foreground">
                          {conditionSummary}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {isDefault
                        ? t('workflow.conditions.fallbackPath')
                        : t('workflow.conditions.logicSummary', { logic: logicLabel })}
                    </div>
                  </div>
                  <NodeSourceHandle
                    nodeId={id}
                    handleId={branch.id}
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
}

export default IfElseNode;