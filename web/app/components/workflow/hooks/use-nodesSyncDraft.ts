import { useReactFlow, useStoreApi } from "@xyflow/react";
import { useCallback } from "react";
import { useWorkflow } from "./use-workflow";
import { useAppStore } from "../../app/store";
import { useAppContext } from "@/context/app-context";

export const useNodesSyncDraft = () => {
  const { getNodes, getEdges } = useReactFlow();

  const doSyncWorkflowDraft = useCallback(async () => {
    const nodes = getNodes();
    const edges = getEdges();
    const appInfo = useAppStore.getState().appInfo;
    console.log('---', nodes, appInfo);
  }, [getNodes, getEdges]);

  return {
    doSyncWorkflowDraft,
  };
};
