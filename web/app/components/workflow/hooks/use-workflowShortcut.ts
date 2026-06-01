import { useCallback, useEffect } from "react";
import { usePlatformShortcut } from "./use-platformShortcut";
import { isTargetInputArea } from "../utils/node";
import { useWorkflowInteractions } from "./use-interactions";
import { useReactFlow } from '@xyflow/react';
import { useWorkflowContext } from "../context";
import { Node, NodeType } from "../types";
import { WORKFLOW_VIEWPORT_EVENT, type WorkflowViewportAction } from "../utils/viewport";

export const useWorkflowShortcut = () => {

  const {
    handleNodesDelete,
    handleNodesCopy,
    handleNodesPaste,
    handleNodesDuplicate,
    handleHistoryRedo,
    handleHistoryUndo
  } = useWorkflowInteractions();
  const reactFlow = useReactFlow();
  const workflowContext = useWorkflowContext();

  const isShortcutAllowed = useCallback((event: KeyboardEvent) => {
    return !isTargetInputArea(event.target as HTMLElement);
  }, []);

  const handleFitView = useCallback(() => {
    void reactFlow.fitView({ padding: 0.18, duration: 240 });
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    void reactFlow.zoomOut({ duration: 180 });
  }, [reactFlow]);

  const handleZoomIn = useCallback(() => {
    void reactFlow.zoomIn({ duration: 180 });
  }, [reactFlow]);

  const handleResetZoom = useCallback(() => {
    void reactFlow.zoomTo(1, { duration: 180 });
  }, [reactFlow]);

  const handleOpenSelectedNodePanel = useCallback(() => {
    const { openNodePanel } = workflowContext.getState();
    const selectedNodes = reactFlow.getNodes().filter((node) => node.selected && node.data.type !== NodeType.Start) as Node[];

    if (selectedNodes.length !== 1) {
      return;
    }

    openNodePanel(selectedNodes[0]);
  }, [reactFlow, workflowContext]);

  const handleClosePanel = useCallback(() => {
    const { activePanel, closePanel } = workflowContext.getState();

    if (!activePanel) {
      return;
    }

    closePanel();
  }, [workflowContext]);

  useEffect(() => {
    const handleViewportAction = (event: Event) => {
      const { detail } = event as CustomEvent<WorkflowViewportAction>;

      switch (detail) {
        case 'fit-view':
          handleFitView();
          break;
        case 'zoom-out':
          handleZoomOut();
          break;
        case 'zoom-in':
          handleZoomIn();
          break;
        case 'reset-zoom':
          handleResetZoom();
          break;
        default:
          break;
      }
    };

    window.addEventListener(WORKFLOW_VIEWPORT_EVENT, handleViewportAction);

    return () => {
      window.removeEventListener(WORKFLOW_VIEWPORT_EVENT, handleViewportAction);
    };
  }, [handleFitView, handleResetZoom, handleZoomIn, handleZoomOut]);

  usePlatformShortcut('s', (event) => {
    event.preventDefault();
    console.log('Workflow saved!');
  });

  usePlatformShortcut('c', (event) => {
    event.preventDefault();
    handleNodesCopy();
  }, { useCapture: true });

  usePlatformShortcut('v', (event) => {
    event.preventDefault();
    handleNodesPaste();
  }, { useCapture: true });

  usePlatformShortcut('d', (event) => {
    if (!isShortcutAllowed(event))
      return;
    event.preventDefault();
    handleNodesDuplicate();
  }, { useCapture: true });

  usePlatformShortcut('r', (event) => {
    event.preventDefault();
    console.log('Workflow reset!');
  }, { useCapture: true, altKey: true, metaKey: false });

  usePlatformShortcut('z', (event) => {
    event.preventDefault();
    handleHistoryRedo();
  }, { useCapture: true });

  usePlatformShortcut(['y', 'shift.z'], (event) => {
    event.preventDefault();
    handleHistoryUndo();
  }, { useCapture: true });

  usePlatformShortcut('o', (event) => {
    event.preventDefault();
    console.log('Workflow tidy up!');
  }, { useCapture: true });

  usePlatformShortcut('1', (event) => {
    event.preventDefault();
    handleFitView();
  }, { useCapture: true });

  usePlatformShortcut('dash', (event) => {
    event.preventDefault();
    handleZoomOut();
  }, { useCapture: true });

  usePlatformShortcut('equalsign', (event) => {
    event.preventDefault();
    handleZoomIn();
  }, { useCapture: true });

  usePlatformShortcut('0', (event) => {
    event.preventDefault();
    handleResetZoom();
  }, { useCapture: true });

  usePlatformShortcut(['delete', 'backspace'], (event) => {
    if (!isShortcutAllowed(event))
      return;
    handleNodesDelete();
    event.preventDefault();
  }, { metaKey: false, ctrlKey: false });

  usePlatformShortcut('enter', (event) => {
    if (!isShortcutAllowed(event))
      return;
    handleOpenSelectedNodePanel();
  }, { metaKey: false, ctrlKey: false });

  usePlatformShortcut('esc', (event) => {
    if (!isShortcutAllowed(event))
      return;
    handleClosePanel();
  }, { metaKey: false, ctrlKey: false });

};