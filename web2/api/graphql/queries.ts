import { gql } from 'graphql-request';

export const GET_ROUTES = gql`
  query {
    routes {
      key,
      label,
      roles,
      sort,
      parent
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query($page: Int, $limit: Int, $id: Int, $username: String, $realName: String, $email: String, $mobile: String, $roleId: Int) {
    accounts(page: $page, limit: $limit, id: $id, username: $username, realName: $realName, email: $email, mobile: $mobile, roleId: $roleId) {
      pageInfo {
        total
      }
      data {
        id,
        username,
        realName,
        email,
        mobile,
        status,
        roles,
        roleKeys,
        created_at,
        created_by
      }
    }
  }
`;

export const GET_ACCOUNT_INFO = gql`
  query {
    accountInfo {
      id,
      username,
      realName,
      mobile,
      email,
      last_ip
    }
  }
`;

export const GET_ROLES = gql`
  query($page: Int, $limit: Int, $id: Int, $key: String, $name: String, $parent: String, $status: Int, $hasRolePerms: Boolean) {
    roles(page: $page, limit: $limit, id: $id, key: $key, name: $name, parent: $parent, status: $status, hasRolePerms: $hasRolePerms) {
      pageInfo {
        total
      }
      data {
        id,
        key,
        name,
        parent,
        status,
        created_at,
        created_by,
        rolePerms {
          key,
          scope,
          perms
        }
      }
    }
  }
`;

export const GET_MENUS = gql`
  query($name: String, $status: Int, $parent: String, $key: String, $module: Boolean) {
    menus(name: $name, status: $status, parent: $parent, key: $key, module: $module) {
      id,
      key,
      name,
      parent,
      status,
      sort,
      module {
        id,
        key,
        name
      }
    }
  }
`;

export const GET_MENUS2 = gql`
  query($name: String, $status: Int, $parent: String, $key: String, $modulePerm: Boolean, $scope: Boolean) {
    menus(name: $name, status: $status, parent: $parent, key: $key, modulePerm: $modulePerm, scope: $scope) {
      id,
      key,
      name,
      parent,
      status,
      sort,
      scope {
        key,
        name
      },
      modulePerm {
        key,
        name
      }
    }
  }
`;

export const GET_MODULES = gql`
  query($page: Int, $limit: Int, $key: String, $name: String) {
    modules(page: $page, limit: $limit, key: $key, name: $name) {
      pageInfo {
        total
      }
      data {
        id,
        key,
        name,
        perms {
          key,
          name,
          restrictLevel
        }
      }
    }
  }
`;

export const GET_DEPS = gql`
  query($name: String, $parent: String, $key: String) {
    deps(name: $name, parent: $parent, key: $key) {
      id,
      key,
      name,
      parent,
      remarks,
      manager {
        id,
        username,
        realName
      }
    }
  }
`;
