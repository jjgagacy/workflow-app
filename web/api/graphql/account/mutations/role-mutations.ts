import { gql } from "graphql-request";


export const CREATE_ROLE = gql`
  mutation CreateRoleMutation($input: RoleInput!) {
    createRole(input: $input) {
      id
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRoleMutation($input: RoleInput!) {
    updateRole(input: $input) {
      id
    }
  }
`;

export const DELETE_ROLE = gql`
  mutation DeleteRoleMutation($id: Int!) {
    deleteRole(id: $id)
  }
`;

export const SET_ROLE_PERMS = `
  mutation SetRolePermsMutation($input: RoleSetPermInput!) {
    setRolePerms(input: $input)
  }
`;
export const CREATE_MENU = gql`
  mutation CreateMenuMutation($input: MenuInput!) {
    createMenu(input: $input) {
      id
    }
  }
`;

export const UPDATE_MENU = gql`
  mutation UpdateMenuMutation($input: MenuInput!) {
    updateMenu(input: $input) {
      id
    }
  }
`;

export const DELETE_MENU = gql`
  mutation DeleteMenuMutation($id: Int!) {
    deleteMenu(id: $id)
  }
`;

