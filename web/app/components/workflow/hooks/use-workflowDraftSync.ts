import { useCallback } from "react";
import { useNodesReadonly } from "./use-nodesReadonly"
import { useNodesSyncDraft } from "./use-nodesSyncDraft";
import { useWorkflowStore } from "../context";

export const useWorkflowDraftSync = () => {
  const { checkIsReadonly } = useNodesReadonly();
  const { doSyncWorkflowDraft } = useNodesSyncDraft();
  const debounceSyncWorkflowDraft = useWorkflowStore((state) => state.debounceSyncWorkflowDraft);

  const handleSyncWorkflowDraft = useCallback((
    immediate?: boolean,
    refreshWhenError?: boolean,
    callback?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
      onFinish?: () => void;
    }
  ) => {
    if (checkIsReadonly())
      return;

    if (immediate)
      doSyncWorkflowDraft(refreshWhenError, callback);
    else
      debounceSyncWorkflowDraft();
  }, [checkIsReadonly, doSyncWorkflowDraft]);

  return {
    handleSyncWorkflowDraft
  }
}