import { gql } from 'graphql-request';

export const GET_NODE_DEFAULT_CONFIG = gql`
  query($nodeType: String!, $codeLanguage: String) {
    nodeTypeDefaultConfig(nodeType: $nodeType, codeLanguage: $codeLanguage)
  }
`;

export const GET_WORKFLOW_DRAFT = gql`
  query($appId: String!) {
    getWorkflowDraft(appId: $appId) {
      id
      appId
      tenantId
      type
      graph
      features
      environmentVariables
      sessionVariables
      createdAt
      updatedAt
      createdBy
      updatedBy
    }
  }
`;