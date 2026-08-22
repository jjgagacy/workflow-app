import { createMutationHook, createQueryHook } from "@/hooks/use-graphql";
import { GetNodeDefaultConfigQueryVariables, GetNodeDefaultConfigResponse } from "./types/node-config.type";
import { GET_NODE_DEFAULT_CONFIG } from "./queries";
import { DELETE_WORKFLOW, SAVE_WORKFLOW_DRAFT } from "./mutations/workflow";
import { WorkflowDraft } from "./types/workflow-draft.type";

export const useGetNodeDefaultConfig = createQueryHook<
  { nodeTypeDefaultConfig: GetNodeDefaultConfigResponse },
  GetNodeDefaultConfigQueryVariables,
  GetNodeDefaultConfigResponse
>(
  GET_NODE_DEFAULT_CONFIG,
  {
    transform: (data) => { return data?.nodeTypeDefaultConfig; }
  }
);

export const useSaveWorkflowDraft = createMutationHook<
  { saveWorkflowDraft: WorkflowDraft },
  {
    input: {
      appId: string;
      graph: Record<string, any>;
      features: Record<string, any>;
      environmentVariables: Record<string, any>;
      sessionVariables: Record<string, any>;
    };
  },
  WorkflowDraft
>(
  SAVE_WORKFLOW_DRAFT,
  {
    transform: (data) => data.saveWorkflowDraft,
  }
);

export const useDeleteWorkflow = createMutationHook<
  { deleteWorkflow: boolean },
  { appId: string },
  boolean
>(
  DELETE_WORKFLOW,
  {
    transform: (data) => data.deleteWorkflow,
  }
);