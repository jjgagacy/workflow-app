import { NodeData, VariableSelector } from "../../types";

export type EndOutputItem = {
  id: string;
  name: string;
  valueSelector?: VariableSelector;
};

export type EndNodeType = NodeData<{
  outputs?: EndOutputItem[];
}>;