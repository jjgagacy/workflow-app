import { NodeData } from "../../types";

export type IfElseNodeData = NodeData & {
  condition?: string;
}