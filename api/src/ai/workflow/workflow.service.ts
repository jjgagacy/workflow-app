import { Injectable } from "@nestjs/common";
import { NODE_TYPE_CLASS_MAPPINGS, LATEST_VERSION } from "./constants";
import { NodeType } from "./types/node-type.enum";

@Injectable()
export class WorkflowService {
  constructor() { }

  public getNodeDefaultConfig(nodeType: string, filters?: Record<string, any>): Record<string, any> | null {
    const nodeClass = NODE_TYPE_CLASS_MAPPINGS[nodeType as NodeType]?.[LATEST_VERSION];
    if (!nodeClass) {
      // throw new Error(`Node class not found for node type: ${nodeType}`);
      return null;
    }
    const defaultConfig = nodeClass.getDefaultConfig(filters);
    if (!defaultConfig || Object.keys(defaultConfig).length === 0) {
      return null;
    }
    return defaultConfig;
  }
}
