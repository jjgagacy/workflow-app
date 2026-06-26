import { NodeData, NodeDefaultData } from "../types";
import { useNodesUpdate } from "./use-nodesUpdate";

export const useSyncNodeInputs = <T>(nodeId: string, data: NodeData<T>) => {
  const { onNodeDataUpdate } = useNodesUpdate();

  const syncNodeInputs = (newData: NodeDefaultData<T>) => {
    onNodeDataUpdate({ id: nodeId, data: newData });
  };

  return {
    nodeInputs: data,
    syncNodeInputs,
  }
}