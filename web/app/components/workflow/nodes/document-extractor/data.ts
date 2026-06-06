import type { NodeDefaultData } from "../../types";
import type { DocumentExtractorNodeData } from "./types";

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
    outputVariableName: 'documentText',
  },
};
