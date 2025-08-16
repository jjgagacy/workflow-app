import { gql } from 'graphql-request';

export const LOGIN_MUTATION = gql`
  mutation LoginMutation($input: LoginInput!) {
    login(input: $input) {
      access_token,
      name,
      roles,
      isSuper
    } 
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccountMutation($input: AccountInput!) {
    createAccount(input: $input) {
      id
    } 
  }
`;

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccountMutation($input: AccountInput!) {
    updateAccount(input: $input) {
      id
    } 
  }
`;

export const UPDATE_ACCOUNT_PASSWORD = gql`
  mutation UpdateAccountPasswordMutation($password: String!, $newPassword: String!) {
    updateAccountPassword(password: $password, newPassword: $newPassword)
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccountMutation($id: Int!) {
    deleteAccount(id: $id)
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRoleMutation($input: RoleInput!) {
    createRole(input: $input) {
      id
    }
  }
`;

export const UPDATE_ROLE =  gql`
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

export const UPDATE_MENU =  gql`
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

export const CREATE_DEP = gql`
  mutation CreateDepMutation($input: DepInput!) {
    createDep(input: $input) {
      id
    }
  }
`

export const UPDATE_DEP = gql`
  mutation UpdateDepMutation($input: DepInput!) {
    updateDep(input: $input) {
      id
     }
  }
`

export const DELETE_DEP = gql`
  mutation DeleteDepMutation($id: Int!) {
    deleteDep(id: $id)
  }
`