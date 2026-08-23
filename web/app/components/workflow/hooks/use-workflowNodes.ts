import { useCallback } from "react"
import { WorkflowUpdateParams } from "../types";
import { EVENT_WORKFLOW_STATE_UPDATE } from "../constants";
import { useReactFlow } from "@xyflow/react";
import { useEventEmitterContext } from "@/context/event-emitter-context";
import { prepareEdges, prepareNodes } from "../utils/node";

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

  return {
    applyWorkflowState
  }
}