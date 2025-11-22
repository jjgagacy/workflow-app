import { Injectable } from "@nestjs/common";
import { BasePluginClient } from "../classes/base-plugin-client";

@Injectable()
export class PluginAgentService {
  constructor(
    private readonly baseClient: BasePluginClient
  ) { }
}

