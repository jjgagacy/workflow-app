import { FormVariableType, VariableDataType, VariableSelector } from "../types";

export const formVariableTypeToVariableType = (formVariable: FormVariableType): VariableDataType => {
  return (
    (
      {
        [FormVariableType.number]: VariableDataType.number,
        [FormVariableType.checkbox]: VariableDataType.boolean,
        [FormVariableType.file]: VariableDataType.file,
        [FormVariableType.fileList]: VariableDataType.array,
        [FormVariableType.boolean]: VariableDataType.boolean,
        [FormVariableType.json]: VariableDataType.object,
      } as Record<FormVariableType, VariableDataType>
    )[formVariable] ?? VariableDataType.string
  );
}

export const isEnvVar = (variableSelector: VariableSelector) => {
  return variableSelector.path[0] === 'env';
}

export const isSessionVar = (variableSelector: VariableSelector) => {
  return variableSelector.path[0] === 'session';
}

export const isSystemVar = (variableSelector: VariableSelector) => {
  return variableSelector.path[0] === 'system';
}

