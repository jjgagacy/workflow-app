import { cn } from "@/utils/classnames";
import { OperatorType } from "../../nodes/if-else/types";
import { NodeType, VariableSelector } from "../../types";
import { VariableIconNode } from "./var-iconNode";
import { getVariableGroupColor, getVariableGroupType } from "./var-functions";
import { VariableIcon } from "./var-icon";
import { VariableName } from "./var-name";

type VariableLabelProps = {
  className?: string;
  nodeTitle?: string;
  varType?: OperatorType;
  nodeType?: NodeType;
  variableSelector?: VariableSelector;
  ref?: React.Ref<HTMLDivElement>;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const VariableLabel = ({
  className,
  varType,
  variableSelector,
  ref,
  onClick,
  nodeTitle,
  nodeType,
}: VariableLabelProps) => {
  const hasVar = !!variableSelector?.nodeId;
  const variableGroup = variableSelector ? getVariableGroupType(variableSelector?.nodeId) : undefined;

  return (
    <div
      className={cn('w-full inline-flex h-6 max-w-full items-center space-x-0.5 rounded-sm border-[var(--border)] px-1.5 shadow-xs', className)}
      ref={ref}
      onClick={onClick}
    >
      {hasVar && nodeType && (
        <VariableIconNode
          nodeType={nodeType}
          nodeTitle={nodeTitle}
        />
      )}
      {variableSelector && (
        <>
          <VariableIcon
            variableSelector={variableSelector}
            variableGroup={variableGroup}
            iconClassName={`h-4 w-4 ${getVariableGroupColor(variableGroup)}`}
          />
          <VariableName
            variableSelector={variableSelector}
          />
        </>
      )}
    </div>
  );
}