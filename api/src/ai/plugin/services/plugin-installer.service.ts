import { Injectable } from "@nestjs/common";
import { BasePluginClient } from "../../../monie/classes/base-plugin-client";

@Injectable()
export class PluginInstallerService {
  constructor(
    private readonly baseClient: BasePluginClient
  ) { }
}
