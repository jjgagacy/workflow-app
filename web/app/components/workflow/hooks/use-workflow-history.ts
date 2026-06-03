'use client';

import { useReactFlow, useStoreApi } from "@xyflow/react"
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { WorkflowHistoryContext } from "../store/workflow-history-store";
import { Edge, Node } from "../types";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { useWorkflowContext } from "../context";

export enum WorkflowHistoryEvent {
  NodesChange = "nodes_change",
  EdgesChange = "edges_change",

  NodeTitleChange = "node_title_change",
  NodeConnect = "node_connect",
  NodeDelete = "node_delete",
  NodeAdd = "node_add",
  NodeUpdate = "node_update",
  NodePaste = "node_paste",
  NodeDragStop = "node_drag_stop",
  NodeResize = "node_resize",

  NoteAdd = "note_add",
  NoteChange = "note_change",

  EdgeDelete = "edge_delete",
  EdgeAdd = "edge_add",
  EdgeUpdate = "edge_update",

  LayoutTidy = "layout_tidy",
  ClearHistory = "clear_history",
}

type WorkflowHistorySnapshot = {
  nodes?: Node[];
  edges?: Edge[];
};

type AddHistoryStateOptions = {
  debounce?: boolean;
};

export const useWorkflowHistory = () => {
  const { t } = useTranslation();
  const store = useStoreApi<Node, Edge>();
  const reactFlow = useReactFlow<Node, Edge>();
  const historyStore = useContext(WorkflowHistoryContext);
  const workflowContext = useWorkflowContext();

  const syncHistoryToReactFlow = useCallback(() => {
    if (!historyStore) {
      return;
    }

    const { nodes, edges } = historyStore.store.getState();
    reactFlow.setNodes(nodes.map((node) => ({ ...node })));
    reactFlow.setEdges(edges.map((edge) => ({ ...edge })));

    const { activePanel, updateActivePanelNode, closePanel } = workflowContext.getState();
    if (activePanel?.type !== "node" || !activePanel.node) {
      return;
    }

    const restoredNode = nodes.find(node => node.id === activePanel.node?.id);
    if (!restoredNode) {
      closePanel();
      return;
    }

    updateActivePanelNode({ ...restoredNode });
  }, [historyStore, reactFlow, workflowContext]);

  const onUndo = useCallback((callback: unknown) => {
  }, []);

  const onRedo = useCallback((callback: unknown) => {
  }, []);

  const handleUndo = useCallback(() => {
    historyStore?.store.temporal.getState().undo();
    syncHistoryToReactFlow();
  }, [historyStore, syncHistoryToReactFlow]);

  const handleRedo = useCallback(() => {
    historyStore?.store.temporal.getState().redo();
    syncHistoryToReactFlow();
  }, [historyStore, syncHistoryToReactFlow]);

  // use DebouceCallback to avoid too many history states when dragging nodes or edges
  const saveToHistory = useCallback((event: WorkflowHistoryEvent, snapshot?: WorkflowHistorySnapshot) => {
    const state = store.getState();
    const nodes = snapshot?.nodes ?? state.nodes;
    const edges = snapshot?.edges ?? state.edges;

    historyStore?.store.setState({
      historyEvent: event,
      nodes: nodes.map((node): Node => ({ ...node })),
      edges: edges.map((edge): Edge => ({ ...edge })),
    });
  }, [historyStore, store]);

  const saveToHistoryDebounce = useDebounceCallback((event: WorkflowHistoryEvent, snapshot?: WorkflowHistorySnapshot) => {
    saveToHistory(event, snapshot);
  }, 500);

  const addHistoryState = useCallback((event: WorkflowHistoryEvent, snapshot?: WorkflowHistorySnapshot, options?: AddHistoryStateOptions) => {
    if (options?.debounce) {
      saveToHistoryDebounce(event, snapshot);
      return;
    }

    saveToHistory(event, snapshot);
  }, [saveToHistory, saveToHistoryDebounce]);

  return {
    onUndo,
    onRedo,
    handleRedo,
    handleUndo,
    addHistoryState,
  }
}