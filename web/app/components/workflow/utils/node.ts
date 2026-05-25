import { Position } from "@xyflow/react";
import { CUSTOM_NODE_NAME } from "../constants";
import { Node } from "../types";

export function newCandidateNode({ data, position, id, zIndex, type, ...rest }: Omit<Node, 'id'> & { id?: string }) {
  const node: Node = {
    id: id || `node-${Date.now()}`,
    type: type || CUSTOM_NODE_NAME,
    data,
    position,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    zIndex: zIndex || 0,
    ...rest,
  };

  return node;
}

export const isTargetInputArea = (target: HTMLElement) => {
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]'),
  );
}