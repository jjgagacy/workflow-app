import { VariableSelector } from "../../../types";

export const useVarName = (variableSelector: VariableSelector) => {
  const paths = variableSelector?.path || [];
  const varName = paths.join('.');
  return varName;
};