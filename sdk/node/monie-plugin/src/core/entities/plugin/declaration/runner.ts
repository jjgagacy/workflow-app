import { PluginArch, PluginLanguage } from "../../enums/plugin.type.js";

export class PluginRunner {
  language: PluginLanguage = PluginLanguage.NODE;
  version: string = "";
  entrypoint: string = "";
}

export class PluginMeta {
  version: string = "";
  arch: PluginArch[] = [];
  runner: PluginRunner = new PluginRunner();
}
