import { useCallback } from "react"
import { Edge, Node, NodeType, WorkflowUpdateParams } from "../types";
import { EVENT_WORKFLOW_STATE_UPDATE } from "../constants";
import { getOutgoers, useReactFlow } from "@xyflow/react";
import { useEventEmitterContext } from "@/context/event-emitter-context";
import { prepareEdges, prepareNodes } from "../utils/node";
import { isIterationNodeType, isLoopNodeType, isStartNodeType } from "../node";

export const useWorkflowNodes = () => {
  const reactflow = useReactFlow();
  const { eventEmitter } = useEventEmitterContext();

  const applyWorkflowState = useCallback((updater: WorkflowUpdateParams) => {
    const { nodes, edges, transform } = updater;
    const { setViewport } = reactflow;

    if (transform) {
      const [x, y, zoom] = transform;
      setViewport({ x, y, zoom });
    }
    eventEmitter?.emit({
      type: EVENT_WORKFLOW_STATE_UPDATE,
      payload: {
        nodes: prepareNodes(nodes, edges),
        edges: prepareEdges(nodes, edges),
      }
    } as any);
  }, [eventEmitter, reactflow]);

  const getExecutableWorkflowNodes = (nodes: Node[], edges: Edge[]) => {
    const startNode = nodes.find(node => isStartNodeType(node.data.type));
    if (!startNode) {
      return { validNodes: [], maxDepth: 0 };
    }
    const validNodesMap = new Map<string, Node>();
    let maxDepth = 0;

    const traverse = (node: Node, depth: number) => {
      // 1. 防死循环：如果节点已被访问过，直接跳过
      if (validNodesMap.has(node.id))
        return;

      // 2. 将当前节点存入 Map
      validNodesMap.set(node.id, node);

      if (depth > maxDepth)
        maxDepth = depth;

      if (isIterationNodeType(node.data.type as NodeType) || isLoopNodeType(node.data.type as NodeType)) {
        const children = nodes.filter(n => n.parentId === node.id);
        children.forEach(child => validNodesMap.set(child.id, child));
      }

      // 5. 递归遍历下游节点
      const outgoers = getOutgoers(node, nodes, edges);
      outgoers.forEach(outNode => traverse(outNode, depth + 1));
    }

    traverse(startNode, 1);

    return {
      validNodes: Array.from(validNodesMap.values()),
      maxDepth,
    };
  };

  return {
    applyWorkflowState,
    getExecutableWorkflowNodes,
  }
}