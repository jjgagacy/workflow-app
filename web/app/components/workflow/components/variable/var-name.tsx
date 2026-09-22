import { VariableSelector } from "../../types";
import { useVarName } from "./hooks/use-varName";

type VarNameProps = {
  variableSelector: VariableSelector;
  className?: string;
}

export const VariableName = ({
  variableSelector,
  className
}: VarNameProps) => {
  const varName = useVarName(variableSelector);
  return (
    <div className={`max-w-[180px] truncate text-text-secondary ${className}`} title={varName}>
      {varName}
    </div>
  );
}