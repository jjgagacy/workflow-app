import { NodeDefaultData } from "../../types";
import { StartNodeData } from "./type";

export const startNodeDefaultData: NodeDefaultData<StartNodeData> = {
  value: {
    formVariables: [],
  },
  validate: function (payload: StartNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    return { valid: true };
  }
};