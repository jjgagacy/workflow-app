import { useCallback } from "react"
import { WorkflowUpdateParams } from "../types";
import { useReactFlow } from "@xyflow/react";

export const useWorkflowNodes = () => {
  const reactflow = useReactFlow()

  const applyWorkflowState = useCallback((updater: WorkflowUpdateParams) => {
    const { nodes, edges, transform } = updater;
    const { setViewport } = reactflow;

    if (transform) {
      const [x, y, zoom] = transform;
      setViewport({ x, y, zoom });
    }

  }, []);

  return {
    applyWorkflowState
  }
}