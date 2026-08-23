import { useCallback, useEffect } from "react";
import { useEventEmitterContext } from "@/context/event-emitter-context";
import { EVENT_WORKFLOW_STATE_UPDATE } from "../constants";
import { useStoreApi, useReactFlow } from "@xyflow/react";
import { useWorkflowStore } from "../context";
import { maskSecretEnvVariables } from "@/utils/env";
import { Edge, Node } from "../types";

type EventEmitterHandlerProps = {
  onWorkflowStateUpdate?: (data: any) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useEventEmitterHandlers = ({ onWorkflowStateUpdate, setNodes, setEdges }: EventEmitterHandlerProps) => {
  const { eventEmitter } = useEventEmitterContext();
  const storeApi = useStoreApi();
  const setEnvVariables = useWorkflowStore((state) => state.setEnvVariables);
  const setChatEnvVariables = useWorkflowStore((state) => state.setChatEnvVariables);
  const { setViewport } = useReactFlow();

  const handleWorkflowStateUpdate = useCallback((payload: any) => {
    const {
      nodes,
      edges,
      features,
      environmentVariables,
      sessionVariables,
      transform
    } = payload;

    setNodes(nodes);
    setEdges(edges);

    if (features) {
      // todo
    }
    if (environmentVariables) {
      // todo
      setEnvVariables(maskSecretEnvVariables(environmentVariables));
    }
    if (sessionVariables) {
      setChatEnvVariables(sessionVariables.map((env: any) => env));
    }
    if (transform) {
      const [x, y, zoom] = transform;
      setViewport({ x, y, zoom });
    }

    if (onWorkflowStateUpdate) {
      onWorkflowStateUpdate(payload);
    }
  }, [setEnvVariables, setChatEnvVariables]);


  eventEmitter?.useSubscription((v: any) => {
    if (v.type === EVENT_WORKFLOW_STATE_UPDATE) {
      handleWorkflowStateUpdate(v.payload);
    }
  });

  return {};
};