import { useAppContext } from "@/context/app-context"
import { useAppStore } from "../../app/store";
import { GetWorkflowDraftResponse, WorkflowDraft } from "@/api/graphql/workflow/types/workflow-draft.type";
import { useCallback, useEffect, useState } from "react";
import { useGetWorkflowDraft } from "@/api/graphql/workflow/queries/workflow-info";
import { useWorkflowContext } from "../context";
import { maskSecretEnvVariables } from "@/utils/env";
import { getErrorMessage } from "@/utils/errors";
import { toast } from "@/app/ui/toast";
import { toTimestamp } from "../utils/workflow";
import { useWorkflowNodes } from "./use-workflowNodes";
import { WorkflowUpdateParams } from "../types";

export const useWorkflowInit = () => {
  const appInfo = useAppStore((state) => state.appInfo);

  const [workflowDraft, setWorkflowDraft] = useState<WorkflowDraft>();
  const [isLoading, setIsLoading] = useState(true);
  const getWorkflowDraft = useGetWorkflowDraft();
  const workflowStore = useWorkflowContext();

  const handleLoadWorkflowDraftData = useCallback(async () => {
    if (!appInfo)
      return;
    try {
      const res = await getWorkflowDraft({ appId: appInfo.id });
      setWorkflowDraft(res);
      workflowStore.setState({
        envVariables: maskSecretEnvVariables(res.environmentVariables || []),
        chatEnvVariables: res.sessionVariables?.map((env: any) => env) || [],
      });
      setIsLoading(false)
    } catch (error: any) {
      console.error("Failed to load workflow draft data:", error);
      toast.error(getErrorMessage(error) || "Failed to load workflow draft data");
    }
  }, [appInfo, getWorkflowDraft]);

  useEffect(() => {
    handleLoadWorkflowDraftData();
  }, []);

  useEffect(() => {
    if (workflowDraft) {
      workflowStore.setState({
        draftUpdatedAt: toTimestamp(workflowDraft.updatedAt)
      });
    }
  }, [workflowDraft]);

  return {
    workflowDraft,
    isLoading
  }
}
