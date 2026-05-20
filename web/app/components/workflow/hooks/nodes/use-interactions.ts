import { NodeMouseHandler, useReactFlow, useStoreApi } from "@xyflow/react";
import { useWorkflowContext, useWorkflowStore } from "../../context";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { useWorkflow } from "../use-workflow";

export const useInteractions = () => {
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

  const handleNodeDoubleClick = useCallback<NodeMouseHandler>((_, node) => {
    if (workflowReadonly())
      return;
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

  return {
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handleNodeMouseMove,
    handleNodeClick,
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
  }
}