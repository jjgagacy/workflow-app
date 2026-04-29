import { useAppStore } from "../../app/store";
import { useWorkflowContext } from "../../workflow/context"

export const useWorkflowPrepare = () => {
  const workflowStore = useWorkflowContext();
  const appInfo = useAppStore(state => state.apps);





}