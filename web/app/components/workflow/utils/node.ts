import { Position } from "@xyflow/react";
import { CATALOG_NODE_TYPE_MAP, CUSTOM_NODE_NAME, CUSTOM_SIMPLE_NODE_NAME, ICON_COLORS, NODE_TYPE_ICON_COLOR_MAP } from "../constants";
import { Node, NodeCatalog, NodeCategory, NodeType } from "../types";

export type ResolvedCatalogNode = {
  nodeType: NodeType;
  renderType: string;
};

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

export const getCustomeNodeType = (node: Node) => {
  if (node.data.type === NodeType.LoopEnd) {
    return CUSTOM_SIMPLE_NODE_NAME;
  }
  return CUSTOM_NODE_NAME;
}

export const resolveCatalogNode = (node: Pick<NodeCatalog, 'id'>): ResolvedCatalogNode | null => {
  const nodeType = CATALOG_NODE_TYPE_MAP[node.id];

  if (!nodeType) {
    return null;
  }

  return {
    nodeType,
    renderType: getCustomeNodeType({ data: { type: nodeType } } as Node),
  };
};

export const isSupportedCatalogNode = (node: Pick<NodeCatalog, 'id'>) => {
  return resolveCatalogNode(node) !== null;
};

export const getCatalogNodeIconColor = (node: Pick<NodeCatalog, 'id' | 'category' | 'section'>) => {
  const resolvedNode = resolveCatalogNode(node);

  if (resolvedNode) {
    return getNodeTypeIconColor(resolvedNode.nodeType);
  }

  if (node.category === NodeCategory.AI) {
    return ICON_COLORS.ai;
  }

  if (node.category === NodeCategory.TOOLS) {
    if (node.section === 'communication') {
      return ICON_COLORS.communication;
    }

    if (node.section === 'development') {
      return ICON_COLORS.development;
    }

    return ICON_COLORS.productivity;
  }

  if (node.category === NodeCategory.CORE) {
    if (node.section === 'triggers') {
      return ICON_COLORS.trigger;
    }

    if (node.section === 'network') {
      return ICON_COLORS.network;
    }

    return ICON_COLORS.knowledge;
  }

  if (node.section === 'flow-control') {
    return ICON_COLORS.flow;
  }

  if (node.section === 'data') {
    return ICON_COLORS.data;
  }

  return ICON_COLORS.neutral;
};

export const getNodeTypeIconColor = (nodeType?: NodeType) => {
  if (!nodeType) {
    return ICON_COLORS.neutral;
  }

  return NODE_TYPE_ICON_COLOR_MAP[nodeType] || ICON_COLORS.neutral;
};