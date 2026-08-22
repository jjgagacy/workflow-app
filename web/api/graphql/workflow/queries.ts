import { gql } from 'graphql-request';

export const GET_NODE_DEFAULT_CONFIG = gql`
  query($nodeType: String!, $codeLanguage: String) {
    nodeTypeDefaultConfig(nodeType: $nodeType, codeLanguage: $codeLanguage)
  }
`;

export const GET_WORKFLOW_DRAFT = gql`
  mutation($appId: String!) {
    getWorkflowDraft(appId: $appId)
  }
`;