import { useAppStore } from "../../app/store";
import { useCallback } from "react";
import { useWorkflowStore } from "../context";

export const useRefreshWorkflowDraft = () => {
  const appInfo = useAppStore((state) => state.appInfo);
  const setIsSyncWorkflowDraft = useWorkflowStore((state) => state.setIsSyncWorkflowDraft);

  const refreshWorkflowDraft = useCallback(() => {
    setIsSyncWorkflowDraft(true);

    // todo

  }, [setIsSyncWorkflowDraft, appInfo]);

  return {
    refreshWorkflowDraft,
  }
}