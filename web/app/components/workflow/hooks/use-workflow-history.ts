'use client';

import { useStoreApi } from "@xyflow/react"
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { WorkflowHistoryContext } from "../store/workflow-history-store";

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

export const useWorkflowHistory = () => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const historyStore = useContext(WorkflowHistoryContext);

  const onUndo = useCallback((callback: unknown) => {
  }, []);

  const onRedo = useCallback((callback: unknown) => {
  }, []);

  const handleUndo = useCallback(() => {
  }, []);

  const handleRedo = useCallback(() => {
  }, []);

  return {
    onUndo,
    onRedo,
    handleRedo,
    handleUndo,
  }
}