export interface PluginResponse {
  data: any;
  status: number;
  headers?: Record<string, string>;
}

export interface PluginInstallTaskResponse {
  allInstalled: boolean;
  taskId: string;
}

export interface PluginInstallationTask {
  id?: string;
  status?: string;
  totalPlugins?: number;
  completedPlugins?: number;
  plugins?: Record<string, any>[];
  [key: string]: any;
}

export interface PluginCheckTaskResponse {
  success: boolean;
  taskInstallations: PluginInstallationTask | null;
}