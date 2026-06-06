import { WORKFLOW_MODEL_DEFAULT_ID } from "../../components/nodes-shared/model-options";
import type { NodeDefaultData, VariableType } from "../../types";
import type { ParameterExtractorItem, ParameterExtractorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const createParameterExtractorItem = (): ParameterExtractorItem => ({
  id: createId('parameter-extractor-item'),
  name: '',
  type: 'string' as VariableType,
  description: '',
});

export const normalizeParameterExtractorItems = (items?: ParameterExtractorItem[]) => {
  const list = (items ?? []).filter(Boolean);
  if (!list.length) {
    return [createParameterExtractorItem()];
  }

  return list;
};

export const parameterExtractorNodeDefaultData: NodeDefaultData<ParameterExtractorNodeData> = {
  value: {
    modelId: WORKFLOW_MODEL_DEFAULT_ID,
    inputVariable: 'input',
    enableVision: false,
    parameters: normalizeParameterExtractorItems(),
    outputVariableName: 'extractedParameters',
  },
};
