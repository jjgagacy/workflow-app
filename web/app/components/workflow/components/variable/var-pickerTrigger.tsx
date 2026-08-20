
import { useTranslation } from "react-i18next";
import { OperatorType } from "../../nodes/if-else/types";
import type { VariableSelector, Node, NodeData } from "../../types";
import { useStoreApi } from "@xyflow/react";
import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { VariableLabel } from "./var-label";

type VarPickerTriggerProps = {
  varType: OperatorType;
  variableSelector?: VariableSelector;
  availableNodes?: Node[];
};

export const VarPickerTrigger = ({
  variableSelector,
  varType,
  availableNodes,
}: VarPickerTriggerProps) => {
  const { t } = useTranslation();
  const storeApi = useStoreApi();
  const { nodes } = storeApi.getState();
  const node = useMemo(() => {
    if (!variableSelector?.nodeId) return undefined;
    return nodes.find((n) => n.id === variableSelector.nodeId);
  }, [nodes, variableSelector?.nodeId]);

  const nodeData = (node?.data as NodeData) || {};
  const hasVariable = Boolean(variableSelector?.nodeId);

  return (
    <div
      className={[
        "flex h-[38px] min-h-[38px] w-full items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted/10",
        !hasVariable && "text-muted-foreground",
      ].join(" ")}
    >
      {hasVariable ? (
        <VariableLabel
          className="h-full border-0 bg-transparent p-0 shadow-none"
          varType={varType}
          nodeTitle={nodeData.label || ""}
          nodeType={nodeData.type}
          variableSelector={variableSelector}
        />
      ) : (
        <span className="truncate">{t("workflow.var.selectVariable")}</span>
      )}

      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
    </div>
  );
}