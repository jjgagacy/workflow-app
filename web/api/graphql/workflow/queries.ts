import { gql } from 'graphql-request';

export const GET_NODE_DEFAULT_CONFIG = gql`
  query($nodeType: String!, $codeLanguage: String) {
    nodeTypeDefaultConfig(nodeType: $nodeType, codeLanguage: $codeLanguage)
  }
`;