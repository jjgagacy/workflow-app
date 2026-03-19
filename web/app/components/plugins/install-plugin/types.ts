export enum InstallStep {
  readyToInstall = 'readyToInstall',
  installing = 'installing',
  installed = 'installed',
  installFailed = 'installFailed',
}

export type PluginSimple = {
  id: string;
  pluginId: string;
  version: string;
}