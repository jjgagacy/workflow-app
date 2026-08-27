import { NodeDefaultData } from "../../types";
import { EndNodeType, EndOutputItem } from "./type";

const createId = (prefix: string) => `${prefix}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;

export const createEndOutputItem = (): EndOutputItem => ({
  id: createId('end-output'),
  name: '',
  valueSelector: undefined,
});

export const EndDefaultData: NodeDefaultData<EndNodeType> = {
  value: {
    outputs: [createEndOutputItem()],
  },
  validate: function (payload: EndNodeType, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    return { valid: true };
  }
};