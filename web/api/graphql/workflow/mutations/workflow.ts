import { gql } from "graphql-request";

export const SAVE_WORKFLOW_DRAFT = gql`
  mutation($input: WorkflowDraftInput!) {
    saveWorkflowDraft(input: $input)
  }
`;

export const DELETE_WORKFLOW = gql`
  mutation($appId: String!) {
    deleteWorkflow(appId: $appId)
  }
`;

