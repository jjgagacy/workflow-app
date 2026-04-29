import { useStoreApi } from "@xyflow/react"
import { useCallback } from "react";

export enum WorkflowHistoryEvent {

}

export const useWorkflowHistory = () => {
  const store = useStoreApi();

  const onUndo = useCallback((callback: unknown) => {
  }, []);

  const onRedo = useCallback((callback: unknown) => {
  }, []);


  return {
    onUndo,
    onRedo,
  }
}