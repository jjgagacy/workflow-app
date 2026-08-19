import { Edge, getOutgoers, Node, useReactFlow, useStoreApi } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import { useTranslation } from "react-i18next"
import { isIterationNodeType, isLoopNodeType, isStartNodeType } from "../node";
import { NodeType } from "../types";
import { SUPPORT_OUTPUT_VARIABLE_NODE_TYPES } from "../constants";

export const useWorkflow = () => {
  const storeApi = useStoreApi();
  const reactFlow = useReactFlow();
  const { t } = useTranslation();

  const workflowReadonly = () => {
    return false;
  }

  // 选中节点
  const onSelectNodes = useCallback((ids: string[], cancelSelection?: boolean) => {
    const { nodes } = storeApi.getState();
    const { setNodes } = reactFlow;
    const selectedNodes = nodes.filter((node) => ids.includes(node.id));

    const newNodes = produce(nodes, (draft) => {
      draft.forEach((node) => {
        if (ids.includes(node.id)) {
          node.selected = !cancelSelection;
        } else {
          node.selected = false;
        }
      });
    });
    setNodes(newNodes);
  }, [storeApi]);

  // 根据id获取
  const getNode = useCallback((nodeId: string) => {
    const { nodes } = storeApi.getState();
    return nodes.find((node) => node.id === nodeId);
  }, [storeApi]);

  const isNodeInIteration = useCallback(
    (nodeId: string): boolean => {
      const { nodes } = storeApi.getState();
      let currentNode = nodes.find(node => node.id === nodeId);
      while (currentNode?.parentId) {
        const parentNode = nodes.find(node => node.id === currentNode?.parentId);
        if (!parentNode) {
          break;
        }
        if (isIterationNodeType(parentNode.data.type as NodeType)) {
          return true;
        }
        currentNode = parentNode;
      }
      return false;
    },
    [storeApi],
  );

  const isNodeInLoop = useCallback(
    (nodeId: string): boolean => {
      const { nodes } = storeApi.getState();
      let currentNode = nodes.find(node => node.id === nodeId);
      while (currentNode?.parentId) {
        const parentNode = nodes.find(node => node.id === currentNode?.parentId);
        if (!parentNode) {
          break;
        }
        if (isLoopNodeType(parentNode.data.type as NodeType)) {
          return true;
        }
        currentNode = parentNode;
      }
      return false;
    },
    [storeApi],
  );

  /// 获取节点信息，包括是否迭代节点、循环节点、开始节点、是否在迭代中、是否在循环中
  const getNodeInfo = useCallback((nodeId: string) => {
    const { nodes } = storeApi.getState();
    const node = nodes.find((node) => node.id === nodeId);
    if (!node) {
      return null;
    }
    const parentNode = node.parentId ? nodes.find(nd => nd.id === node.parentId) : null;
    return {
      node,
      isIterationNode: isIterationNodeType(node.data.type as NodeType),
      isLoopNode: isLoopNodeType(node.data.type as NodeType),
      isStartNode: isStartNodeType(node.data.type as NodeType),
      isInIteration: isNodeInIteration(nodeId),
      isInLoop: isNodeInLoop(nodeId),
      parentNode
    }
  }, [storeApi]);

  /// 当前节点 nodeId 可关联的变量来源节点，收集变量来源使用
  /// 从起始节点出发，遍历得到的叶子节点
  /// 当前节点 nodeId 的直接前驱节点
  /// 然后过滤出支持输出变量的节点。
  const getLeafNodes = useCallback((nodeId: string) => {
    const { nodes, edges } = storeApi.getState();
    const node = nodes.find(node => node.id === nodeId);
    // 开始节点列表
    let startNodes = nodes.filter(node => isStartNodeType(node.data.type as NodeType));
    // 查找同一父容器下的迭代/循环开始节点
    if (node?.parentId) {
      const startNode = nodes.find(nd => nd.parentId === node.parentId && (isIterationNodeType(nd.data.type as NodeType) || isLoopNodeType(nd.data.type as NodeType)));
      if (startNode) {
        startNodes = [startNode];
      }
    }
    if (!startNodes.length) {
      return [];
    }
    // 收集叶子节点（迭代方式）
    const collectLeafNodes = (startNodes: Node[]) => {
      const result: Node[] = [];
      const visited = new Set<string>();
      const stack: Node[] = [...startNodes];

      while (stack.length > 0) {
        const currentNode = stack.pop()!;
        if (visited.has(currentNode.id) || currentNode.id === nodeId) continue;
        visited.add(currentNode.id);
        // 查找当前节点的所有子节点（通过 edges 连线）
        const childEdges = edges.filter(edge => edge.source === currentNode.id);
        const childNodes = childEdges.map(edge => nodes.find(node => node.id === edge.target)).filter(Boolean) as Node[];
        if (childNodes.length === 0) {
          result.push(currentNode); // 没有子节点 → 叶子节点
        } else {
          stack.push(...childNodes); // 有子节点 → 继续遍历
        }
      }
      return result;
    }
    const leafNodes = collectLeafNodes(startNodes);

    // 收集目标节点的前驱节点
    const incomerEdges = edges.filter(edge => edge.target === nodeId);
    const incomerNodes = incomerEdges.map(edge => nodes.find(node => node.id === edge.source)).filter(Boolean) as Node[];

    const allNodes = [...leafNodes, ...incomerNodes];
    // const uniqueNodes = Array.from(new Set(allNodes.map(node => node.id))).map(id => allNodes.find(node => node.id === id)) as Node[];
    const uniqueNodes = Array.from(new Map(allNodes.map(node => [node.id, node])).values()) as Node[];
    return uniqueNodes.filter(nd => SUPPORT_OUTPUT_VARIABLE_NODE_TYPES.includes(nd.data.type as NodeType));
  }, [storeApi]);

  /// 返回目标节点的所有前置节点，遍历 edges 连线
  const getPrecedingNodesOnPath = useCallback((nodeId: string, options?: {
    nodes: Node[],
    edges: Edge[],
  }) => {
    const { nodes: defaultNodes, edges: defaultEdges } = storeApi.getState();
    const nodes = options?.nodes || defaultNodes;
    const edges = options?.edges || defaultEdges;
    const node = nodes.find(node => node.id === nodeId);
    if (!node) {
      return [];
    }

    const visited = new Set<string>();

    // 递归收集前置节点
    const collectPrecedingNodes = (currentNode: Node, visited: Set<string>): Node[] => {
      if (visited.has(currentNode.id)) {
        return [];
      }
      visited.add(currentNode.id);
      const incomerEdges = edges.filter(edge => edge.target === currentNode.id);
      const incomerNodes = incomerEdges.map(edge => nodes.find(node => node.id === edge.source)).filter(Boolean) as Node[];
      let precedingNodes: Node[] = [...incomerNodes];
      for (const incomerNode of incomerNodes) {
        precedingNodes = [...precedingNodes, ...collectPrecedingNodes(incomerNode, visited)];
      }
      return precedingNodes;
    }

    const precedingNodes = collectPrecedingNodes(node, visited);
    // 去重
    const uniqueNodes = Array.from(new Map(precedingNodes.map(node => [node.id, node])).values()) as Node[];
    return uniqueNodes;
  }, [storeApi]);

  /// 返回目标节点的所有前置节点，包括父节点
  //场景：只有父子关系，没有连线
  // ┌─────────────────────────────────────┐
  // │  Group A (parentId: undefined)      │
  // │    └── Node B (parentId: 'A')       │
  // │          └── Node C (parentId: 'B') │
  // └─────────────────────────────────────┘
  const getUpstreamNodesWithParent = useCallback((nodeId: string, options?: {
    nodes: Node[],
    edges: Edge[],
  }) => {
    const precedingNodes = getPrecedingNodesOnPath(nodeId, options);

    const { nodes: defaultNodes, edges: defaultEdges } = storeApi.getState();
    const nodes = options?.nodes || defaultNodes;
    const node = nodes.find(node => node.id === nodeId);

    if (node?.parentId) {
      const parentNode = nodes.find(nd => nd.id === node.parentId);
      if (parentNode && !precedingNodes.some(nd => nd.id === parentNode.id)) {
        precedingNodes.push(parentNode);
      }
    }

    return precedingNodes;
  }, [storeApi, getPrecedingNodesOnPath]);

  return {
    workflowReadonly,
    onSelectNodes,
    getNode,
    getNodeInfo,
    getLeafNodes,
    getUpstreamNodesWithParent
  }
}