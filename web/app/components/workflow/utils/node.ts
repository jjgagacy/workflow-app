import { Position, Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";
import { CATALOG_NODE_TYPE_MAP, CUSTOM_NODE_NAME, CUSTOM_SIMPLE_NODE_NAME, ICON_COLORS, NODE_INITIAL_POSITION, NODE_POSITION_OFFSETS, NODE_TYPE_ICON_COLOR_MAP } from "../constants";
import { Edge, Node, NodeCatalog, NodeCategory, NodeType } from "../types";
import { getNodeTypeIcon } from "../data";
import { produce } from "immer";

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

export const removePrivateData = <T extends { data?: Record<string, unknown> }>(
  items: T[],
): T[] => {
  return produce(items, (draft) => {
    draft.forEach((item) => {
      const data = item.data
      if (!data)
        return

      const record = data as Record<string, unknown>

      Object.keys(record).forEach((key) => {
        if (key.startsWith('_'))
          delete record[key]
      });
    });
  });
}

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const clonedObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }

  return clonedObj as T;
};

const processNodesAndEdges = (nodes: Node[], edges: Edge[]) => {
  // 处理节点和边的逻辑
  // 这里可以根据需要进行节点和边的预处理，例如设置默认值、调整位置等
  return { nodes, edges };
};

const normalizeNodeIcon = (node: Node) => {
  const icon = node.data?.icon;
  if (!icon || typeof icon !== 'object' || !('type' in icon) || !('props' in icon)) {
    return icon;
  }

  return getNodeTypeIcon(node.data.type, 'h-4 w-4');
};

export const prepareNodes = (originNodes: Node[], originEdges: Edge[]) => {
  // 深拷贝 + 预处理
  const { nodes, edges } = processNodesAndEdges(deepClone(originNodes), deepClone(originEdges));
  const firstNode = nodes[0];

  // 如果第一个节点没有位置，则为所有节点设置默认位置
  if (!firstNode?.position) {
    nodes.forEach((node, index) => {
      node.position = { x: NODE_INITIAL_POSITION.x + index * NODE_POSITION_OFFSETS.x, y: NODE_INITIAL_POSITION.y + index * NODE_POSITION_OFFSETS.y };
    });
  }

  // 构建迭代器和循环节点的映射关系
  const iterationOrLoopNodeMap = nodes.reduce((map, node) => {
    if (node.parentId) {
      if (map[node.parentId]) {
        map[node.parentId].push({ nodeId: node.id, nodeType: node.data.type as NodeType });
      } else {
        map[node.parentId] = [{ nodeId: node.id, nodeType: node.data.type as NodeType }];
      }
    }
    return map;
  }, {} as Record<string, { nodeId: string, nodeType: NodeType }[]>);

  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      icon: normalizeNodeIcon(node),
    },
  }));
};

const getCycleEdges = (nodes: Node[], edges: Edge[]) => {
  const adjacencyList: Record<string, string[]> = {};

  // 构建邻接表
  edges.forEach((edge) => {
    if (!adjacencyList[edge.source]) {
      adjacencyList[edge.source] = [];
    }
    adjacencyList[edge.source].push(edge.target);
  });

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  const cycleEdges: Edge[] = [];

  const dfs = (nodeId: string): boolean => {
    if (!visited[nodeId]) {
      visited[nodeId] = true;
      recStack[nodeId] = true;

      const neighbors = adjacencyList[nodeId] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor] && dfs(neighbor)) {
          cycleEdges.push({ source: nodeId, target: neighbor } as Edge);
          return true;
        } else if (recStack[neighbor]) {
          cycleEdges.push({ source: nodeId, target: neighbor } as Edge);
          return true;
        }
      }
    }
    recStack[nodeId] = false;
    return false;
  };

  for (const node of nodes) {
    if (dfs(node.id)) {
      return cycleEdges;
    }
  }

  return cycleEdges;
};

const removeCycleEdges = (
  nodes: Node[],
  edges: Edge[],
): Edge[] => {
  let result = [...edges];

  while (true) {
    const cycleEdges = getCycleEdges(nodes, result);

    if (cycleEdges.length === 0) {
      return result;
    }

    // 删除环中的一条边
    const edgeToRemove = cycleEdges[cycleEdges.length - 1];

    result = result.filter(
      (edge) =>
        !(
          edge.source === edgeToRemove.source &&
          edge.target === edgeToRemove.target
        ),
    );
  }
  return result;
};

export const prepareEdges = (originNodes: Node[], originEdges: Edge[]) => {
  // 深拷贝 + 预处理
  const { nodes, edges } = processNodesAndEdges(deepClone(originNodes), deepClone(originEdges));
  // 构建节点映射和选中节点
  let selectedNode: Node | null = null;
  const nodesMap = nodes.reduce((map, node) => {
    map[node.id] = node;

    if (node.selected)
      selectedNode = node;

    return map;
  }, {} as Record<string, Node>);
  // 移除环形边并设置 zIndex
  return removeCycleEdges(nodes, edges).map((edge) => {
    const sourceNode = nodesMap[edge.source];
    const targetNode = nodesMap[edge.target];

    if (!sourceNode || !targetNode) {
      return edge;
    }

    // 如果源节点或目标节点是选中节点，则将边的 zIndex 设置为 1，否则设置为 0
    const zIndex = (selectedNode && (sourceNode.id === selectedNode.id || targetNode.id === selectedNode.id)) ? 1 : 0;

    return {
      ...edge,
      zIndex,
    };
  });
};