import { Node, NodeType } from "./types";
export const initialNodes: Node[] = [];

export const isStartNodeType = (nodeType: NodeType) => {
  return nodeType === NodeType.Start || nodeType === NodeType.Webhook || nodeType === NodeType.Schedule;
};

export const isLoopNodeType = (nodeType: NodeType) => {
  return nodeType === NodeType.LoopStart;
};

export const isIterationNodeType = (nodeType: NodeType) => {
  return nodeType === NodeType.IterationStart;
};