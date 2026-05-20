import { useReactFlow, useStoreApi } from "@xyflow/react";
import { produce } from "immer";
import { useCallback } from "react";
import { useTranslation } from "react-i18next"

export const useWorkflow = () => {
  const store = useStoreApi();
  const reactFlow = useReactFlow();
  const { t } = useTranslation();

  const workflowReadonly = () => {
    return false;
  }

  const onSelectNodes = useCallback((ids: string[], cancelSelection?: boolean) => {
    const { nodes } = store.getState();
    const { setNodes } = reactFlow;
    const selectedNodes = nodes.filter((node) => ids.includes(node.id));

    const newNodes = produce(nodes, (draft) => {
      draft.forEach((node) => {
        if (ids.includes(node.id)) {
          node.selected = !cancelSelection;
        } else {
          node.selected = false;
        }
      });
    });

    setNodes(newNodes);

  }, [store]);

  return {
    workflowReadonly,
    onSelectNodes,
  }
}