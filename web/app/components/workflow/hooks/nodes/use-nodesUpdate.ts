import { useReactFlow, useStoreApi } from "@xyflow/react"
import { useCallback } from "react";
import { UpdateNodeData } from "../../components/note-node/types";
import { useWorkflow } from "../use-workflow";
import { produce } from "immer";

export const useNodesUpdate = () => {
  const store = useStoreApi();
  const { workflowReadonly } = useWorkflow();
  const reactFlow = useReactFlow();

  const onNodeDataUpdate = useCallback(({ id, data }: UpdateNodeData) => {
    if (workflowReadonly())
      return;

    const { nodes } = store.getState();
    const nodeIndex = nodes.findIndex((node) => node.id === id);
    const { addNodes } = reactFlow;
    const newNodes = produce(nodes, draft => {
      const node = draft[nodeIndex];
      const newNode = {
        ...node,
        data: {
          ...node.data,
          ...data,
        },
      };
      draft[nodeIndex] = newNode;
    });

    addNodes(newNodes);
  }, []);

  return {
    onNodeDataUpdate,
  }
}