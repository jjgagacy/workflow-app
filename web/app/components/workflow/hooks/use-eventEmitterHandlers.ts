import { useEffect } from "react";
import { useEventEmitterContext } from "@/context/event-emitter-context";
import { EVENT_WORKFLOW_STATE_UPDATE } from "../constants";
import { useStoreApi } from "@xyflow/react";

type EventEmitterHandlerProps = {
  onWorkflowStateUpdate?: (data: any) => void;
}

export const useEventEmitterHandlers = ({ onWorkflowStateUpdate }: EventEmitterHandlerProps = {}) => {
  const { eventEmitter } = useEventEmitterContext();
  const storeApi = useStoreApi();
  const { setNodes, setEdges } = storeApi.getState();

  const handleWorkflowStateUpdate = (data: any) => {
    console.log('handleWorkflowStateUpdate', data);
    setNodes(data.nodes);
    setEdges(data.edges);
    if (data.transform) {
      const [x, y, zoom] = data.transform;
      storeApi.setState({ transform: [x, y, zoom] });
    }
    if (onWorkflowStateUpdate) {
      onWorkflowStateUpdate(data);
    }
  };

  eventEmitter?.useSubscription((v: any) => {
    if (v.type === EVENT_WORKFLOW_STATE_UPDATE) {
      handleWorkflowStateUpdate(v.payload);
    }
  });

  return {};
};