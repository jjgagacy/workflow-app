import { useWorkflowContext, useWorkflowStore } from "../context";
import { useCallback } from "react";
import { Edge, Node } from "../types";
import { useStoreApi } from "@xyflow/react";
import { useWorkflow } from "./use-workflow";

export const SNAP_GUIDE_THRESHOLD = 8;

export const useHelpLine = () => {
  const workflowContext = useWorkflowContext();
  const storeApi = useStoreApi<Node, Edge>();
  const { isNodeInIteration, isNodeInLoop } = useWorkflow();

  const handleSetGuildLines = useCallback((node: Node) => {
    const { nodes } = storeApi.getState();
    const { setHorizontalSnapGuideLines, setVerticalSnapGuideLines } = workflowContext.getState();

    if (isNodeInIteration(node.id))
      return { showHorizontalSnapGuideLineNodes: [], showVerticalSnapGuideLineNodes: [] };
    if (isNodeInLoop(node.id))
      return { showHorizontalSnapGuideLineNodes: [], showVerticalSnapGuideLineNodes: [] };

    const showHorizontalSnapGuideLineNodes = nodes.filter((n) => {
      if (n.id === node.id)
        return false;
      if (isNodeInIteration(n.id))
        return false;
      if (isNodeInLoop(n.id))
        return false;
      const y = Math.ceil(n.position.y);
      const ny = Math.ceil(node.position.y);

      if (Math.abs(y - ny) <= SNAP_GUIDE_THRESHOLD)
        return true;
      return false;
    }).sort((a, b) => a.position.x - b.position.x);

    if (showHorizontalSnapGuideLineNodes.length > 0) {
      const first = showHorizontalSnapGuideLineNodes[0];
      const last = showHorizontalSnapGuideLineNodes[showHorizontalSnapGuideLineNodes.length - 1];
      const firstWidth = first.width ?? first.measured?.width ?? 0;
      const lastWidth = last.width ?? last.measured?.width ?? 0;
      const currentWidth = node.width ?? node.measured?.width ?? 0;

      const helpLine = {
        top: first.position.y,
        left: first.position.x,
        width: last.position.x + lastWidth - first.position.x,
      };

      if (node.position.x < first.position.x) {
        helpLine.left = node.position.x;
        helpLine.width = first.position.x + firstWidth - node.position.x;
      }
      if (node.position.x > last.position.x) {
        helpLine.width = node.position.x + currentWidth - first.position.x;
      }
      setHorizontalSnapGuideLines([helpLine]);
    } else {
      setHorizontalSnapGuideLines([]);
    }

    const showVerticalSnapGuideLineNodes = nodes.filter((n) => {
      if (n.id === node.id)
        return false;
      if (isNodeInIteration(n.id))
        return false;
      if (isNodeInLoop(n.id))
        return false;
      const x = Math.ceil(n.position.x);
      const nx = Math.ceil(node.position.x);

      if (Math.abs(x - nx) <= SNAP_GUIDE_THRESHOLD)
        return true;
      return false;
    }).sort((a, b) => a.position.y - b.position.y);

    if (showVerticalSnapGuideLineNodes.length > 0) {
      const first = showVerticalSnapGuideLineNodes[0];
      const last = showVerticalSnapGuideLineNodes[showVerticalSnapGuideLineNodes.length - 1];
      const firstHeight = first.height ?? first.measured?.height ?? 0;
      const lastHeight = last.height ?? last.measured?.height ?? 0;
      const currentHeight = node.height ?? node.measured?.height ?? 0;

      const helpLine = {
        top: first.position.y,
        left: first.position.x,
        height: last.position.y + lastHeight - first.position.y,
      };

      if (node.position.y < first.position.y) {
        helpLine.top = node.position.y;
        helpLine.height = first.position.y + firstHeight - node.position.y;
      }
      if (node.position.y > last.position.y) {
        helpLine.height = node.position.y + currentHeight - first.position.y;
      }
      setVerticalSnapGuideLines([helpLine]);
    } else {
      setVerticalSnapGuideLines([]);
    }

    return {
      showHorizontalSnapGuideLineNodes,
      showVerticalSnapGuideLineNodes,
    }

  }, []);

  return {
    handleSetGuildLines,
  }
}