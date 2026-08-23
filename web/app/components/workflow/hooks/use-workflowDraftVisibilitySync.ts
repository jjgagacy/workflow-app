import { useCallback, useEffect, useRef } from "react";
import { useRefreshWorkflowDraft } from "./use-refreshWorkflowDraft";

type WorkflowDraftVisibilitySyncProps = {
  syncWorkflowDraftWhenHidden: () => void;
}

export const useWorkflowDraftVisibilitySync = ({ syncWorkflowDraftWhenHidden }: WorkflowDraftVisibilitySyncProps) => {

  const { refreshWorkflowDraft } = useRefreshWorkflowDraft();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      syncWorkflowDraftWhenHidden();
      return;
    }
    if (document.visibilityState === 'visible') {
      refreshTimerRef.current = setTimeout(() => {
        refreshWorkflowDraft();
      }, 500);
    }
  }, [syncWorkflowDraftWhenHidden, refreshWorkflowDraft]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [handleVisibilityChange]);
}