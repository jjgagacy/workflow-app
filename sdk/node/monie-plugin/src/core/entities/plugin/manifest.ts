export class PluginManifest {
  providers: string[] = [];
  tools: string[] = [];
  models: string[] = [];
  endpoints: string[] = [];
  agentStrategies: string[] = [];

  constructor(data?: Partial<PluginManifest>) {
    Object.assign(this, data);
  }
}

export class PluginFiles {
  tools: string[] = [];
  models: string[] = [];
  endpoints: string[] = [];
  agentStrategies: string[] = [];

  constructor(data?: Partial<PluginManifest>) {
    Object.assign(this, data);
  }
}

