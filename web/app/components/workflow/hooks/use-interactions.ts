import { Connection, EdgeMouseHandler, NodeMouseHandler, OnResize, ResizeParamsWithDirection, useReactFlow, useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { useCallback, useContext } from "react";
import { produce } from "immer";
import { useWorkflow } from "./use-workflow";
import { useWorkflowContext, useWorkflowStore } from "../context";
import { Edge, Node, NodeAddParams, NodeType } from "../types";
import { newCandidateNode } from "../utils/node";
import { CUSTOM_EDGE_NAME, CUSTOM_NOTE_NODE_NAME, NODE_DEFAULT_DATA, NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH } from "../constants";
import { WorkflowHistoryContext } from "../store/workflow-history-store";
import { useWorkflowHistory, WorkflowHistoryEvent } from "./use-workflow-history";
// import { useWorkflowHistory } from "./use-workflow-history";

const PASTE_OFFSET = 32;
const CHILD_NODE_OFFSET_X = 20;
const CHILD_NODE_OFFSET_Y = 60;
const CHILD_NODE_GAP_Y = 108;

const collectNodeIdsWithDescendants = (nodes: Node[], rootNodeIds: string[]) => {
  const collectedIds = new Set(rootNodeIds);
  const queue = [...rootNodeIds];

  while (queue.length) {
    const currentNodeId = queue.shift();
    if (!currentNodeId) {
      continue;
    }

    nodes.forEach((node) => {
      if (node.parentId !== currentNodeId || collectedIds.has(node.id)) {
        return;
      }

      collectedIds.add(node.id);
      queue.push(node.id);
    });
  }

  return collectedIds;
};

export const useWorkflowInteractions = () => {
  const { t } = useTranslation();
  const store = useStoreApi<Node, Edge>();
  const workflowContext = useWorkflowContext();
  const reactFlow = useReactFlow<Node, Edge>();
  const historyStore = useContext(WorkflowHistoryContext);
  const { handleUndo, handleRedo, addHistoryState } = useWorkflowHistory();
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

    const clonedNodes = sourceNodes.map(node => produce(node, (draft) => {
      draft.id = idMap.get(node.id) || `node-${Date.now()}`;
      draft.position = {
        x: targetX + (node.position.x - minX),
        y: targetY + (node.position.y - minY),
      };
      // 如果原节点有父节点，则将其 parentId 更新为克隆后的父节点 ID；否则设为 undefined
      draft.parentId = node.parentId ? idMap.get(node.parentId) : undefined;
      draft.selected = true;
      draft.dragging = false;
      draft.data = {
        ...draft.data,
        candidate: false,
      };
    }));

    const nextNodes = produce(nodes as Node[], (draft) => {
      draft.forEach((node) => {
        node.selected = false;
      });

      draft.push(...clonedNodes);
    });

    setNodes(nextNodes);
    addHistoryState(WorkflowHistoryEvent.NodePaste, { nodes: nextNodes, edges: store.getState().edges });

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

    const { activePanel, openNodePanel } = workflowContext.getState();

    onSelectNodes([node.id]);

    if (activePanel) {
      openNodePanel(node as Node);
    }
  }, [onSelectNodes, workflowContext, workflowReadonly]);

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
        sourceType: sourceNode.data.type,
        targetType: targetNode.data.type,
      }
    };
    const newEdges = produce(edges, draft => {
      draft.push(newEdge);
    });
    setEdges(newEdges);
    addHistoryState(WorkflowHistoryEvent.NodeConnect, { nodes, edges: newEdges });
  }, [addHistoryState, reactFlow, store, workflowReadonly]);

  const handleNodeDoubleClick = useCallback<NodeMouseHandler>((_, node) => {
    const { openNodePanel } = workflowContext.getState();
    if (node.type === CUSTOM_NOTE_NODE_NAME)
      return;
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

    const { nodes, edges } = store.getState();
    const nextNodes = produce(nodes as Node[], (draft) => {
      const currentNode = draft.find(item => item.id === node.id);
      if (!currentNode)
        return;

      currentNode.position = { ...node.position };
      currentNode.selected = node.selected;
      currentNode.dragging = false;
    });

    addHistoryState(WorkflowHistoryEvent.NodeDragStop, { nodes: nextNodes, edges });
  }, [addHistoryState, store, workflowReadonly]);

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

    const { nodes, edges } = store.getState();
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
    addHistoryState(WorkflowHistoryEvent.NodeResize, { nodes: newNodes, edges }, { debounce: true });
  }, [addHistoryState, reactFlow, store, workflowReadonly]);

  const handleNodeDelete = useCallback((id: string, options?: { skipHistory?: boolean }) => {
    if (workflowReadonly())
      return;
    const { nodes, edges } = store.getState();
    const { setNodes, setEdges } = reactFlow;

    const nodeToDelete = nodes.find(n => n.id === id);
    if (!nodeToDelete)
      return;

    const deletedNodeIds = collectNodeIdsWithDescendants(nodes as Node[], [id]);

    const newNodes = nodes.filter((node) => !deletedNodeIds.has(node.id));
    const newEdges = edges.filter(edge => !deletedNodeIds.has(edge.source) && !deletedNodeIds.has(edge.target));
    setNodes(newNodes);
    setEdges(newEdges);
    if (!options?.skipHistory) {
      addHistoryState(WorkflowHistoryEvent.NodeDelete, { nodes: newNodes, edges: newEdges });
    }
  }, [addHistoryState, reactFlow, store, workflowReadonly]);

  const handleNodeToggleDisabled = useCallback((id: string) => {
    if (workflowReadonly())
      return;

    const { nodes, edges } = store.getState();
    const { setNodes } = reactFlow;
    const { activePanel, updateActivePanelNode } = workflowContext.getState();

    const targetNode = nodes.find((node) => node.id === id);
    if (!targetNode) {
      return;
    }

    const nextNodes = produce(nodes as Node[], (draft) => {
      const currentNode = draft.find((node) => node.id === id);
      if (!currentNode) {
        return;
      }

      currentNode.data = {
        ...currentNode.data,
        disabled: !currentNode.data.disabled,
      };
    });

    setNodes(nextNodes);

    if (activePanel?.type === 'node' && activePanel.node?.id === id) {
      const updatedNode = nextNodes.find((node) => node.id === id);
      if (updatedNode) {
        updateActivePanelNode(updatedNode);
      }
    }

    addHistoryState(WorkflowHistoryEvent.NodeUpdate, { nodes: nextNodes, edges });
  }, [addHistoryState, reactFlow, store, workflowContext, workflowReadonly]);

  const handleSelectedNodesToggleDisabled = useCallback(() => {
    if (workflowReadonly())
      return;

    const { nodes, edges } = store.getState();
    const { setNodes } = reactFlow;
    const selectedNodes = nodes.filter((node) => node.selected && node.data.type !== NodeType.Start);

    if (!selectedNodes.length) {
      return;
    }

    const shouldDisable = selectedNodes.some((node) => !node.data.disabled);
    const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
    const nextNodes = produce(nodes as Node[], (draft) => {
      draft.forEach((node) => {
        if (!selectedNodeIds.has(node.id)) {
          return;
        }

        node.data = {
          ...node.data,
          disabled: shouldDisable,
        };
      });
    });

    setNodes(nextNodes);
    addHistoryState(WorkflowHistoryEvent.NodeUpdate, { nodes: nextNodes, edges });
  }, [addHistoryState, reactFlow, store, workflowReadonly]);

  const handleNodesDelete = useCallback(() => {
    if (workflowReadonly())
      return;
    const { nodes, edges } = store.getState();
    const { setNodes, setEdges } = reactFlow;

    const selectedNodes = nodes.filter(n => n.selected && n.data.type != NodeType.Start);

    if (!selectedNodes.length)
      return;

    const selectedNodeIds = collectNodeIdsWithDescendants(nodes as Node[], selectedNodes.map(node => node.id));
    const newNodes = nodes.filter(node => !selectedNodeIds.has(node.id));
    const newEdges = edges.filter(edge => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target));
    setNodes(newNodes);
    setEdges(newEdges);
    addHistoryState(WorkflowHistoryEvent.NodeDelete, { nodes: newNodes, edges: newEdges });
  }, [addHistoryState, reactFlow, store, workflowReadonly]);

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
    const { nodeId, parentNodeId, sourceHandle, targetHandle, previousNodeId, previousNodeSourceHandle, nextNodeId, nextNodeTargetHandle } = params;
    const { setCandidateNode, setShowNodeSelector } = workflowContext.getState();

    if (nodeId) {
      const { nodes, edges } = store.getState();
      const { setNodes } = reactFlow;
      const { activePanel, updateActivePanelNode } = workflowContext.getState();
      const targetNode = nodes.find((node) => node.id === nodeId);

      if (!targetNode) {
        setShowNodeSelector(false);
        return;
      }

      const nextNodes = produce(nodes as Node[], (draft) => {
        draft.forEach((node) => {
          node.selected = node.id === nodeId;
        });

        const currentNode = draft.find((node) => node.id === nodeId);
        if (!currentNode) {
          return;
        }

        currentNode.type = renderType || currentNode.type;
        currentNode.data = {
          ...NODE_DEFAULT_DATA[nodeType],
          type: nodeType,
          label,
          description,
          icon,
          iconColor,
          disabled: currentNode.data.disabled,
          size: currentNode.data.size,
          candidate: false,
        };
      });

      // If the node type has changed, we need to update the edges connected to this node to ensure compatibility 
      // with the new node type. This may involve removing incompatible edges or updating edge data.
      setNodes(nextNodes);

      // Update the node in the active panel if it is currently open
      if (activePanel?.type === 'node' && activePanel.node?.id === nodeId) {
        const updatedNode = nextNodes.find((node) => node.id === nodeId);
        if (updatedNode) {
          updateActivePanelNode(updatedNode);
        }
      }

      addHistoryState(WorkflowHistoryEvent.NodeUpdate, { nodes: nextNodes, edges });
      setCandidateNode(undefined);
      setShowNodeSelector(false);
      return;
    }

    if (parentNodeId) {
      const { nodes, edges } = store.getState();
      const { setNodes, setEdges } = reactFlow;
      const parentNode = nodes.find((node) => node.id === parentNodeId);

      if (!parentNode) {
        setShowNodeSelector(false);
        return;
      }

      const childNodes = nodes.filter((node) => node.parentId === parentNodeId);
      // 只在明确指定了 previousNodeId（来自 source handle 点击）时才自动连 edge
      const edgeSourceNode = previousNodeId
        ? nodes.find((node) => node.id === previousNodeId) ?? null
        : null;

      const newNode = newCandidateNode({
        type: renderType,
        parentId: parentNodeId,
        extent: 'parent',
        draggable: true,
        selected: true,
        data: {
          ...NODE_DEFAULT_DATA[nodeType],
          type: nodeType,
          label,
          description,
          icon,
          iconColor,
          candidate: false,
        },
        position: {
          x: CHILD_NODE_OFFSET_X,
          y: CHILD_NODE_OFFSET_Y + childNodes.length * CHILD_NODE_GAP_Y,
        }
      });

      const nextNodes = produce(nodes as Node[], (draft) => {
        draft.forEach((node) => {
          node.selected = false;
        });

        draft.push(newNode);
      });

      // 有明确的前驱节点（来自 source handle 点击）才自动连 edge
      const nextEdges = edgeSourceNode
        ? produce(edges, (draft) => {
          draft.push({
            id: `${edgeSourceNode.id}-output-${newNode.id}-target`,
            type: CUSTOM_EDGE_NAME,
            source: edgeSourceNode.id,
            sourceHandle: 'output',
            target: newNode.id,
            targetHandle: 'target',
            data: {
              hovering: false,
              sourceType: edgeSourceNode.data.type,
              targetType: nodeType,
            },
          });
        })
        : edges;

      setNodes(nextNodes);
      if (nextEdges !== edges) setEdges(nextEdges);
      addHistoryState(WorkflowHistoryEvent.NodeAdd, { nodes: nextNodes, edges: nextEdges });
      setCandidateNode(undefined);
      setShowNodeSelector(false);
      return;
    }

    if (previousNodeId && nextNodeId) {
      const { nodes, edges } = store.getState();
      const { setNodes, setEdges } = reactFlow;
      const previousNode = nodes.find((node) => node.id === previousNodeId);
      const nextNode = nodes.find((node) => node.id === nextNodeId);

      if (!previousNode || !nextNode) {
        setShowNodeSelector(false);
        return;
      }

      const previousWidth = previousNode.measured?.width ?? NODE_DEFAULT_WIDTH;
      const previousHeight = previousNode.measured?.height ?? NODE_DEFAULT_HEIGHT;
      const nextWidth = nextNode.measured?.width ?? NODE_DEFAULT_WIDTH;
      const nextHeight = nextNode.measured?.height ?? NODE_DEFAULT_HEIGHT;
      const centerX = (previousNode.position.x + previousWidth / 2 + nextNode.position.x + nextWidth / 2) / 2;
      const centerY = (previousNode.position.y + previousHeight / 2 + nextNode.position.y + nextHeight / 2) / 2;

      const newNode = newCandidateNode({
        type: renderType,
        parentId: previousNode.parentId,
        selected: true,
        data: {
          ...NODE_DEFAULT_DATA[nodeType],
          type: nodeType,
          label,
          description,
          icon,
          iconColor,
        },
        position: {
          x: centerX - NODE_DEFAULT_WIDTH / 2,
          y: centerY - NODE_DEFAULT_HEIGHT / 2,
        }
      });

      const nextNodes = produce(nodes as Node[], (draft) => {
        draft.forEach((node) => {
          node.selected = false;
        });

        draft.push(newNode);
      });

      const nextEdges = produce(edges, (draft) => {
        const oldEdgeIndex = draft.findIndex((edge) =>
          edge.source === previousNodeId &&
          edge.sourceHandle === previousNodeSourceHandle &&
          edge.target === nextNodeId &&
          edge.targetHandle === nextNodeTargetHandle
        );

        if (oldEdgeIndex >= 0) {
          draft.splice(oldEdgeIndex, 1);
        }

        draft.push({
          id: `${previousNodeId}-${previousNodeSourceHandle || 'source'}-${newNode.id}-target`,
          type: CUSTOM_EDGE_NAME,
          source: previousNodeId,
          sourceHandle: previousNodeSourceHandle,
          target: newNode.id,
          data: {
            hovering: false,
            sourceType: previousNode.data.type,
            targetType: nodeType,
          }
        });

        draft.push({
          id: `${newNode.id}-source-${nextNodeId}-${nextNodeTargetHandle || 'target'}`,
          type: CUSTOM_EDGE_NAME,
          source: newNode.id,
          target: nextNodeId,
          targetHandle: nextNodeTargetHandle,
          data: {
            hovering: false,
            sourceType: nodeType,
            targetType: nextNode.data.type,
          }
        });
      });

      setNodes(nextNodes);
      setEdges(nextEdges);
      setCandidateNode(undefined);
      setShowNodeSelector(false);
      return;
    }

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
      if (!currentEdge.data) {
        currentEdge.data = { hovering: true } as any;
      } else {
        currentEdge.data.hovering = true;
      }
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
      if (!currentEdge?.data)
        return;
      currentEdge.data.hovering = false;
    });
    setEdges(newEdges);
  }, [reactFlow, store, workflowReadonly]);

  const handleEdgeDelete = useCallback(() => {
    if (workflowReadonly())
      return;
  }, [workflowReadonly]);

  const handleEdgesChange = useCallback((changes: Array<{ type?: string }>, nextEdges: Edge[]) => {
    if (workflowReadonly())
      return;
    if (!changes.length)
      return;

    const hasAdd = changes.some(change => change.type === 'add');
    const hasRemove = changes.some(change => change.type === 'remove');

    if (!hasAdd && !hasRemove)
      return;

    addHistoryState(hasRemove ? WorkflowHistoryEvent.EdgeDelete : WorkflowHistoryEvent.EdgeAdd, {
      nodes: store.getState().nodes,
      edges: nextEdges,
    });
  }, [addHistoryState, store, workflowReadonly]);

  const handleHistoryUndo = useCallback(() => {
    if (workflowReadonly())
      return;

    if (!historyStore) {
      throw new Error("UndoRedo must be used within a WorkflowHistoryProvider");
    }
    handleUndo();
  }, [store, workflowContext]);

  const handleHistoryRedo = useCallback(() => {
    if (workflowReadonly())
      return;

    if (!historyStore) {
      throw new Error("UndoRedo must be used within a WorkflowHistoryProvider");
    }
    handleRedo();
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
    handleNodeToggleDisabled,
    handleNodesDelete,
    handleSelectedNodesToggleDisabled,
    handleNodesCopy,
    handleNodesPaste,
    handleNodesDuplicate,
    handleNodesSelectAll,
    handleNodesUnselectAll,
    handleEdgeEnter,
    handleEdgeLeave,
    handleEdgeDelete,
    handleEdgesChange,
    handleHistoryUndo,
    handleHistoryRedo,
  }
}
