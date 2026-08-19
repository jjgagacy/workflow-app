import { FormVariableType, VariableDataType } from "../types";

export const formVariableTypeToVariableType = (formVariable: FormVariableType): VariableDataType => {
  return (
    (
      {
        [FormVariableType.textInput]: VariableDataType.string,
        [FormVariableType.textArea]: VariableDataType.string,
        [FormVariableType.number]: VariableDataType.number,
        [FormVariableType.select]: VariableDataType.string,
        [FormVariableType.multiSelect]: VariableDataType.array,
        [FormVariableType.checkbox]: VariableDataType.boolean,
        [FormVariableType.radio]: VariableDataType.string,
        [FormVariableType.file]: VariableDataType.file,
        [FormVariableType.fileList]: VariableDataType.array,
        [FormVariableType.boolean]: VariableDataType.boolean,
        [FormVariableType.object]: VariableDataType.object,
        [FormVariableType.json]: VariableDataType.object,
      } as Record<FormVariableType, VariableDataType>
    )[formVariable] ?? VariableDataType.string
  );
}
