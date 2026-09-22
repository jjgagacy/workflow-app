import type { NodeDefaultData, VariableDataType } from "../../types";
import type { ParameterExtractorItem, ParameterExtractorNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_PARAMETER_EXTRACTOR_NAME = 'result';

export const createParameterExtractorItem = (): ParameterExtractorItem => ({
  id: createId('parameter-extractor-item'),
  name: '',
  type: 'string' as VariableDataType,
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
    modelId: '',
    provider: 'OpenAI',
    enableVision: false,
    parameters: normalizeParameterExtractorItems(),
    outputVariableName: DEFAULT_PARAMETER_EXTRACTOR_NAME,
  },
  validate: function (payload: ParameterExtractorNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    if (!payload.modelId) {
      return { valid: false, errorMessage: t('workflow.checkList.error.parameterExtractorModelMissing') };
    }

    if (!payload.inputVariable?.nodeId || !payload.inputVariable?.path?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.parameterExtractorInputVariableMissing') };
    }

    const parameters = normalizeParameterExtractorItems(payload.parameters);
    if (parameters.length === 0) {
      return { valid: false, errorMessage: t('workflow.checkList.error.parameterExtractorParameterMissing') };
    }

    for (let index = 0; index < parameters.length; index += 1) {
      const parameter = parameters[index];

      if (!parameter.name?.trim()) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.parameterExtractorParameterNameMissing', { index: index + 1 }),
        };
      }

      if (!parameter.description?.trim()) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.parameterExtractorParameterDescriptionMissing', { index: index + 1 }),
        };
      }
    }

    if (!payload.outputVariableName?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.parameterExtractorOutputVariableMissing') };
    }

    return { valid: true };
  }
};
