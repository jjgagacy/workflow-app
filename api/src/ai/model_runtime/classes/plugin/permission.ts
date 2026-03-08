export class ToolPermission {
  enabled: boolean = false;
}

export class ModelPermission {
  enabled: boolean = false;
}

export class NodePermission {
  enabled: boolean = false;
}

export class EndpointPermission {
  enabled: boolean = false;
}

export class AppPermission {
  enabled: boolean = false;
}

export class StoragePermission {
  enabled: boolean = false;
  size: number = 1048576; // 1MB
}

export class PluginPermission {
  tool?: ToolPermission;
  model?: ModelPermission;
  node?: NodePermission;
  endpoint?: EndpointPermission;
  app?: AppPermission;
  storage?: StoragePermission;
}

export class PluginResourceRequirements {
  memory: number = 0;
  permission?: PluginPermission;
}
