
export class NodeConfig {
  module: string;
  class: string;
  cpuBound: boolean;
  models: string[] = [];

  constructor(data: Partial<NodeConfig> = {}) {
    this.module = data.module || '';
    this.class = data.class || '';
    this.cpuBound = data.cpuBound || false;
    this.models = data.models || [];
  }
}

export class PythonConfig {
  module: string;

  constructor(data: Partial<PythonConfig> = {}) {
    this.module = data.module || '';
  }
}

export class ToolConfigurationExtra {
  node?: NodeConfig | undefined;
  python?: PythonConfig | undefined;

  constructor(data: Partial<ToolConfigurationExtra> = {}) {
    this.node = data.node || undefined;
    this.python = data.python || undefined;
  }
}

