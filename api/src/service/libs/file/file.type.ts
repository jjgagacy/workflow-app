import { FileTransferMethod, FileType } from "./file.enum";

export enum ImageDetail {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ORIGINAL = 'original',
}

export interface ImageConfig {
  numberLimits?: number;
  transferMethods?: FileTransferMethod[];
  detail?: ImageDetail;
}

export interface FileUploadConfig {
  numberLimits?: number;
  imageConfig?: ImageConfig;
  allowedFileTypes?: FileType[];
  allowedFileExtensions?: string[];
  allowedFileUploadMethods?: FileTransferMethod[];
}
