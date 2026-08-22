import { useWorkflowStore } from "../context";
import { WorkflowRunningStatus } from "../types";

export const useNodesReadonly = () => {
  const runningState = useWorkflowStore((state) => state.workflowRunningState);

  const checkIsReadonly = () => {
    return runningState?.state.status === WorkflowRunningStatus.Running;
  }

  return {
    checkIsReadonly
  }
}