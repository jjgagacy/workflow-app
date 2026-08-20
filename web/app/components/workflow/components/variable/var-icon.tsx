import { cn } from "@/utils/classnames";
import { VariableSelector } from "../../types";
import { renderVariableByGroup, renderVariableTypeImage, VariableGroupType } from "./var-functions";

type VariableIcon = {
  variableSelector: VariableSelector;
  className?: string;
  variableGroup?: VariableGroupType | string;
  iconClassName?: string;
}

export const VariableIcon = ({ variableSelector, className, variableGroup, iconClassName }: VariableIcon) => {
  return (
    <div className={cn('shrink-0', className)}>
      {variableGroup ?
        renderVariableByGroup(variableGroup as VariableGroupType, iconClassName) :
        renderVariableTypeImage(variableSelector.nodeId, iconClassName)
      }
    </div>
  );
}