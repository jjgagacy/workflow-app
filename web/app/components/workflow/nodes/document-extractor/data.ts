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
    inputVariable: '',
    outputVariableName: DEFAULT_OUTPUT_VARIABLE_NAME,
  },
};

