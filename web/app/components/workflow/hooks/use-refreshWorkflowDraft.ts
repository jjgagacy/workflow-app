import { useAppStore } from "../../app/store";
import { useCallback } from "react";
import { useWorkflowStore } from "../context";
import { useGetWorkflowDraft } from "@/api/graphql/workflow/queries/workflow-info";
import { useWorkflowNodes } from "./use-workflowNodes";
import { WorkflowUpdateParams } from "../types";

export const useRefreshWorkflowDraft = () => {
  const appInfo = useAppStore((state) => state.appInfo);
  const setIsSyncWorkflowDraft = useWorkflowStore((state) => state.setIsSyncWorkflowDraft);
  const getWorkflowDraft = useGetWorkflowDraft();
  const { applyWorkflowState } = useWorkflowNodes();
  const setEnvVariables = useWorkflowStore((state) => state.setEnvVariables);
  const setChatEnvVariables = useWorkflowStore((state) => state.setChatEnvVariables);

  const refreshWorkflowDraft = useCallback(async () => {
    if (!appInfo)
      return;

    setIsSyncWorkflowDraft(true);
    try {
      const res = await getWorkflowDraft({ appId: appInfo.id });
      console.log('refreshWorkflowDraft res', res);
      applyWorkflowState(res.graph as WorkflowUpdateParams);
      setEnvVariables(res.environmentVariables?.map((env: any) => env.type === 'secret' ? { ...env, value: '[__HIDDEN__]' } : env) || []);
      setChatEnvVariables(res.sessionVariables?.map((env: any) => env) || []);
    } finally {
      setIsSyncWorkflowDraft(false);
    }
  }, [setIsSyncWorkflowDraft, appInfo, setEnvVariables, setChatEnvVariables, getWorkflowDraft, applyWorkflowState]);

  return {
    refreshWorkflowDraft,
  }
}