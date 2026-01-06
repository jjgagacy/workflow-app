import { Injectable } from "@nestjs/common";
import { BasePluginClient } from "../../../monie/classes/base-plugin-client";

@Injectable()
export class PluginModelClientService {
  constructor(
    private readonly baseClient: BasePluginClient
  ) { }

}

