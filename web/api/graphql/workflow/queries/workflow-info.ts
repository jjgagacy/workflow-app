import { createQueryHook } from "@/hooks/use-graphql";
import { GET_WORKFLOW_DRAFT } from "../queries";
import { GetWorkflowDraftResponse, WorkflowDraft } from "../types/workflow-draft.type";

export const useGetWorkflowDraft = createQueryHook<
  GetWorkflowDraftResponse,
  { appId: string },
  WorkflowDraft
>(
  GET_WORKFLOW_DRAFT,
  {
    transform: (data) => { return data?.getWorkflowDraft; }
  }
);
