import type { NodeDefaultData } from "../../types";
import type { DocumentExtractorNodeData } from "./types";

export const DEFAULT_OUTPUT_VARIABLE_NAME = 'text';

export const DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS = [
  'pdf',
  'doc',
  'docs',
  'txt',
  'markdown',
  'md',
  'html',
  'csv',
  'xls',
  'pptx',
] as const;

export const documentExtractorNodeDefaultData: NodeDefaultData<DocumentExtractorNodeData> = {
  value: {
    outputVariableName: DEFAULT_OUTPUT_VARIABLE_NAME,
  },
  validate: function (payload: DocumentExtractorNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    if (!payload.inputVariable?.nodeId || !payload.inputVariable?.path?.length) {
      return { valid: false, errorMessage: t('workflow.checkList.error.documentExtractorInputVariableMissing') };
    }

    if (!payload.outputVariableName?.trim()) {
      return { valid: false, errorMessage: t('workflow.checkList.error.documentExtractorOutputVariableMissing') };
    }

    return { valid: true };
  }
};

