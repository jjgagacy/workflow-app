import { gql } from "graphql-request";


export const CREATE_MODULE = gql`
  mutation CreateModuleMutation($input: ModuleInput!) {
    createModule(input: $input) {
      id
    }
  }
`;

export const UPDATE_MODULE = gql`
  mutation UpdateModuleMutation($input: ModuleInput!) {
    updateModule(input: $input) {
      id
    }
  }
`;

export const DELETE_MODULE = gql`
  mutation DeleteModuleMutation($id: Int!) {
    deleteModule(id: $id)
  }
`;

export const CREATE_MODULE_PERM = gql`
  mutation CreateModulePermMutation($input: PermInput!) {
    createPerm(input: $input)
  }
`;

export const UPDATE_MODULE_PERM = gql`
  mutation UpdateModulePermMutation($input: PermInput!) {
    updatePerm(input: $input)
  }
`;

export const DELETE_MODULE_PERM = gql`
  mutation DeleteModulePermMutation($input: PermInput!) {
    deletePerm(input: $input)
  }
`;
