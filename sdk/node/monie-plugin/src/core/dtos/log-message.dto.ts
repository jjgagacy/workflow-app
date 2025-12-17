export enum LogStatus {
  START = 'start',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface LogMetadata {
  [key: string]: any;
}

export interface LogMessage {
  id: string;
  label: string;
  parentId?: string | undefined;
  error?: string | undefined;
  status?: string | undefined;
  data: Record<string, any>;
  metadata?: LogMetadata | undefined;
}

