import { addEdge, Connection, EdgeMouseHandler, NodeMouseHandler, OnResize, ResizeParamsWithDirection, useReactFlow, useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { produce } from "immer";
import { useWorkflow } from "./use-workflow";
import { useWorkflowContext, useWorkflowStore } from "../context";
import { Node, NodeAddParams, NodeType } from "../types";
import { newCandidateNode } from "../utils/node";
import { CUSTOM_EDGE_NAME, NODE_DEFAULT_DATA } from "../constants";

const PASTE_OFFSET = 32;

export const useWorkflowInteractions = () => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const workflowContext = useWorkflowContext();
  const reactFlow = useReactFlow();
  const {
    workflowReadonly
  } = useWorkflow();
  const {
    onSelectNodes
  } = useWorkflow();

  const cloneNodes = useCallback((sourceNodes: Node[], options?: {
    targetPosition?: { x: number; y: number };
    updateClipboard?: boolean;
  }) => {
    const { nodes } = store.getState();
    const { setNodes } = reactFlow;
    const { setCopiedNodes } = workflowContext.getState();

    if (!sourceNodes.length)
      return;

    const minX = Math.min(...sourceNodes.map(node => node.position.x));
    const minY = Math.min(...sourceNodes.map(node => node.position.y));
    const targetX = options?.targetPosition?.x ?? minX + PASTE_OFFSET;
    const targetY = options?.targetPosition?.y ?? minY + PASTE_OFFSET;
    const idSeed = Date.now();
    const idMap = new Map(sourceNodes.map((node, index) => [node.id, `node-${idSeed}-${index}`]));

    const clonedNodes = sourceNodes.map((node) => {
      const nextNode = structuredClone(node) as Node;
      nextNode.id = idMap.get(node.id) || `node-${Date.now()}`;
      nextNode.position = {
        x: targetX + (node.position.x - minX),
        y: targetY + (node.position.y - minY),
      };
      nextNode.parentId = node.parentId ? idMap.get(node.parentId) : undefined;
      nextNode.selected = true;
      nextNode.dragging = false;
      nextNode.data = {
        ...nextNode.data,
        candidate: false,
      };

      return nextNode;
    });

    const nextNodes = produce(nodes as Node[], (draft) => {
      draft.forEach((node) => {
        node.selected = false;
      });

      draft.push(...clonedNodes);
    });

    setNodes(nextNodes);

    if (options?.updateClipboard) {
      setCopiedNodes(clonedNodes);
    }
  }, [reactFlow, store, workflowContext]);

  const handleNodeMouseEnter = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;

    const { nodes, edges } = store.getState();
    const { addNodes, addEdges } = reactFlow;

  }, [store, workflowContext]);

  const handleNodeMouseLeave = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;

    const { nodes, edges } = store.getState();
    const { addNodes, addEdges } = reactFlow;
  }, [store, workflowContext]);

  const handleNodeMouseMove = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;
    if (node.data.type === NodeType.Start)
      return;
    onSelectNodes([node.id]);
  }, [store, workflowContext]);

  const handleConnectStart = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleConnectEnd = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleConnect = useCallback((params: Connection) => {
    if (workflowReadonly())
      return;
    const { source, sourceHandle, target, targetHandle } = params;
    if (source === target)
      return;

    const { edges, nodes } = store.getState();
    const { setEdges } = reactFlow;

    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode)
      return;

    if (targetNode.parentId !== sourceNode.parentId)
      return;

    // 检查是否已存在相同的连线
    if (edges.find(edge =>
      edge.source === source &&
      edge.sourceHandle === sourceHandle &&
      edge.target === target &&
      edge.targetHandle === targetHandle
    )) {
      return;
    }

    const parentNode = nodes.find(n => n.id === sourceNode.parentId);

    const newEdge = {
      ...params,
      id: `${source}-${sourceHandle}-${target}-${targetHandle}`,
      type: CUSTOM_EDGE_NAME,
      source: source,
      target: target,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      data: {
        hovering: false,
        sourceType: nodes.find(n => n.id === source)?.data.type, // NodeType
        targetType: nodes.find(n => n.id === target)?.data.type, // NodeType
      }
    };
    const newEdges = produce(edges, draft => {
      draft.push(newEdge);
    });
    setEdges(newEdges);
  }, [reactFlow, store, workflowReadonly]);

  const handleNodeDoubleClick = useCallback<NodeMouseHandler>((_, node) => {
    const { openNodePanel } = workflowContext.getState();
    openNodePanel(node as Node);
  }, [store, workflowContext]);

  const handleNodeDrag = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeDragStart = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeDragStop = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeSelectionChange = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeSelectionDrag = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeSelectionDragStart = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeSelectionDragStop = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeSelectionStart = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeSelectionEnd = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleNodeResize = useCallback((id: string, params: ResizeParamsWithDirection) => {
    if (workflowReadonly())
      return;

    const { nodes } = store.getState();
    const { setNodes } = reactFlow;
    const { x, y, width, height } = params;
    const node = nodes.find(n => n.id === id);

    const newNodes = produce(nodes, draft => {
      const targetNode = draft.find(n => n.id === id);
      if (targetNode) {
        targetNode.position = { x, y };
        targetNode.data = {
          ...targetNode.data,
          size: { width, height }
        };
      }
    });
    setNodes(newNodes);
  }, [store, workflowContext]);

  const handleNodeDelete = useCallback((id: string) => {
    if (workflowReadonly())
      return;
    const { nodes, edges } = store.getState();
    const { setNodes, setEdges } = reactFlow;

    const index = nodes.findIndex(n => n.id === id);
    const nodeToDelete = nodes[index];
    if (!nodeToDelete)
      return;

    const newNodes = produce(nodes, draft => {
      draft.splice(index, 1);
    });
    setNodes(newNodes);
  }, [store, workflowContext]);

  const handleNodesDelete = useCallback(() => {
    if (workflowReadonly())
      return;
    const { nodes, edges } = store.getState();
    const { setNodes, setEdges } = reactFlow;

    const selectedNodes = nodes.filter(n => n.selected && n.data.type != NodeType.Start);

    selectedNodes.forEach(node => {
      handleNodeDelete(node.id);
    });
  }, [store, workflowContext]);

  const handleNodesCopy = useCallback((id?: string) => {
    if (workflowReadonly())
      return;
    const { nodes } = store.getState();
    const { setCopiedNodes } = workflowContext.getState();
    const copiedNodes = (id
      ? nodes.filter(node => node.id === id)
      : nodes.filter(node => node.selected && node.data.type != NodeType.Start)) as Node[];

    setCopiedNodes(copiedNodes);

  }, [store, workflowContext]);

  const handleNodesPaste = useCallback(() => {
    if (workflowReadonly())
      return;

    const { screenToFlowPosition } = reactFlow;
    const { copiedNodes, mousePosition } = workflowContext.getState();

    if (!copiedNodes.length)
      return;

    const minX = Math.min(...copiedNodes.map(node => node.position.x));
    const minY = Math.min(...copiedNodes.map(node => node.position.y));
    const baseX = (mousePosition.x + mousePosition.offsetX) || minX + PASTE_OFFSET;
    const baseY = (mousePosition.y + mousePosition.offsetY) || minY + PASTE_OFFSET;
    const { x, y } = screenToFlowPosition({ x: baseX, y: baseY });

    cloneNodes(copiedNodes, {
      targetPosition: { x, y },
      updateClipboard: true,
    });
  }, [cloneNodes, reactFlow, workflowContext]);

  const handleNodesDuplicate = useCallback((id?: string) => {
    if (workflowReadonly())
      return;

    const { nodes } = store.getState();
    const duplicatedNodes = (id
      ? nodes.filter(node => node.id === id)
      : nodes.filter(node => node.selected && node.data.type != NodeType.Start)) as Node[];

    cloneNodes(duplicatedNodes);
  }, [cloneNodes, store, workflowReadonly]);

  const handleNodesSelectAll = useCallback(() => {
    if (workflowReadonly())
      return;

    const { nodes } = store.getState();
    const { setNodes } = reactFlow;

    if (!nodes.length)
      return;

    const newNodes = produce(nodes, draft => {
      draft.forEach((node) => {
        node.selected = true;
      });
    });

    setNodes(newNodes);
  }, [reactFlow, store, workflowReadonly]);

  const handleNodesUnselectAll = useCallback(() => {
    if (workflowReadonly())
      return;

    const { nodes } = store.getState();
    const { setNodes } = reactFlow;

    if (!nodes.length)
      return;

    const newNodes = produce(nodes, draft => {
      draft.forEach((node) => {
        node.selected = false;
      });
    });

    setNodes(newNodes);
  }, [reactFlow, store, workflowReadonly]);

  const handleNodeAdd = useCallback<NodeAddParams>((params) => {
    if (workflowReadonly())
      return;

    const { renderType, nodeType, label, description, icon, iconColor } = params;
    const { nodeId, sourceHandle, targetHandle, previousNodeId, previousNodeSourceHandle, nextNodeId, nextNodeTargetHandle } = params;
    const { setCandidateNode, setShowNodeSelector } = workflowContext.getState();

    const newNode = newCandidateNode({
      type: renderType,
      data: {
        ...NODE_DEFAULT_DATA[nodeType],
        type: nodeType,
        label,
        description,
        candidate: true,
        icon,
        iconColor,
      },
      position: {
        x: 0,
        y: 0
      }
    });
    setCandidateNode(newNode);
    setShowNodeSelector(false);

  }, [reactFlow, workflowContext, t]);

  const handleEdgeEnter = useCallback<EdgeMouseHandler>((_, edge) => {
    if (workflowReadonly())
      return;

    const { edges } = store.getState();
    const { setEdges } = reactFlow;
    const newEdges = produce(edges, draft => {
      const currentEdge = draft.find(e => e.id === edge.id);
      if (!currentEdge)
        return;

      currentEdge.data = {
        ...currentEdge.data,
        hovering: true,
      };
    });
    setEdges(newEdges);
  }, [reactFlow, store, workflowReadonly]);

  const handleEdgeLeave = useCallback<EdgeMouseHandler>((_, edge) => {
    if (workflowReadonly())
      return;

    const { edges } = store.getState();
    const { setEdges } = reactFlow;
    const newEdges = produce(edges, draft => {
      const currentEdge = draft.find(e => e.id === edge.id);
      if (!currentEdge)
        return;

      currentEdge.data = {
        ...currentEdge.data,
        hovering: false,
      };
    });
    setEdges(newEdges);
  }, [reactFlow, store, workflowReadonly]);

  const handleEdgeDelete = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  const handleEdgesChange = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [store, workflowContext]);

  return {
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handleNodeMouseMove,
    handleNodeClick,
    handleNodeAdd,
    handleConnect,
    handleConnectStart,
    handleConnectEnd,
    handleNodeDoubleClick,
    handleNodeDrag,
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodeSelectionChange,
    handleNodeSelectionDrag,
    handleNodeSelectionDragStart,
    handleNodeSelectionDragStop,
    handleNodeSelectionStart,
    handleNodeSelectionEnd,
    handleNodeResize,
    handleNodeDelete,
    handleNodesDelete,
    handleNodesCopy,
    handleNodesPaste,
    handleNodesDuplicate,
    handleNodesSelectAll,
    handleNodesUnselectAll,
    handleEdgeEnter,
    handleEdgeLeave,
    handleEdgeDelete,
    handleEdgesChange
  }
}
