export enum InstallStep {
  readyToInstall = 'readyToInstall',
  installing = 'installing',
  installed = 'installed',
  isntallFailed = 'installFailed',
}

export type PluginSimple = {
  id: string;
  pluginId: string;
  version: string;
}