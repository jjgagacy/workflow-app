import { useReactFlow, useStoreApi } from "@xyflow/react";
import { useCallback } from "react";
import { useWorkflow } from "./use-workflow";
import { useAppStore } from "../../app/store";
import { useAppContext } from "@/context/app-context";
import { isStartNode, isStartNodeType } from "../node";
import { removePrivateData } from "../utils/node";
import { useWorkflowContext, useWorkflowStore } from "../context";
import { useSaveWorkflowDraft } from "@/api/graphql/workflow";
import { getErrorMessage } from "@/utils/errors";
import { toast } from "@/app/ui/toast";
import { useRefreshWorkflowDraft } from "./use-refreshWorkflowDraft";
import { toTimestamp } from "../utils/workflow";

export const useNodesSyncDraft = () => {
  const { getNodes, getEdges } = useReactFlow();
  const storeApi = useStoreApi();
  const saveWorkflowDraft = useSaveWorkflowDraft();
  const appInfo = useAppStore.getState().appInfo;
  const setDraftUpdatedAt = useWorkflowStore((s) => s.setDraftUpdatedAt);
  const { refreshWorkflowDraft } = useRefreshWorkflowDraft();
  const workflowStore = useWorkflowContext();

  const getSyncWorkflowData = useCallback(() => {
    const { nodes, edges, transform } = storeApi.getState();

    if (!appInfo)
      return;

    const hasStartNode = nodes.some(node => isStartNode(node));
    if (!hasStartNode)
      return;

    const filterNodes = removePrivateData(nodes);
    const filterEdges = removePrivateData(edges);
    const { envVariables, chatEnvVariables } = workflowStore.getState();
    const [x, y, zoom] = transform;

    return {
      graph: {
        nodes: filterNodes,
        edges: filterEdges,
        transform: [x, y, zoom],
      },
      features: {},
      environmentVariables: envVariables,
      sessionVariables: chatEnvVariables,
    }
  }, [getNodes, getEdges, storeApi, appInfo]);

  const doSyncWorkflowDraft = useCallback(async (
    refreshWhenError: boolean = true,
    callback?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
      onFinish?: () => void;
    }
  ) => {
    if (!appInfo)
      return;

    const postData = getSyncWorkflowData();
    console.log('doSyncWorkflowDraft postData', postData)
    if (!postData)
      return;

    try {
      const res = await saveWorkflowDraft({
        input: {
          appId: appInfo.id,
          ...postData,
        }
      });
      setDraftUpdatedAt(toTimestamp(res.updatedAt));
      callback?.onSuccess && callback?.onSuccess();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
      callback?.onError && callback?.onError(error);
      if (refreshWhenError) {
        refreshWorkflowDraft();
      }
      return;
    } finally {
      callback?.onFinish && callback?.onFinish();
    }
  }, [getNodes, getEdges, storeApi, appInfo, setDraftUpdatedAt, refreshWorkflowDraft]);

  return {
    doSyncWorkflowDraft,
  };
};
