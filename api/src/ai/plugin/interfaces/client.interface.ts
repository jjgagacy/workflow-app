import { ReadStream } from "fs";

export interface PluginRequestOptions {
  method: string;
  path: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, string>;
  files?: Record<string, FileItem>;
  stream?: boolean;
}

export interface FileItem {
  value: Buffer | ReadStream | string;
  options?: {
    filename?: string;
    contentType?: string;
  }
}

