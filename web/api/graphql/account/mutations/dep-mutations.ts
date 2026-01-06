import { gql } from "graphql-request";


export const CREATE_DEP = gql`
  mutation CreateDepMutation($input: DepInput!) {
    createDep(input: $input) {
      id
    }
  }
`;

export const UPDATE_DEP = gql`
  mutation UpdateDepMutation($input: DepInput!) {
    updateDep(input: $input) {
      id
     }
  }
`;

export const DELETE_DEP = gql`
  mutation DeleteDepMutation($id: Int!) {
    deleteDep(id: $id)
  }
`;
