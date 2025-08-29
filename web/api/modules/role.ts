// services/roleService.ts
import { useGraphQLQuery, useGraphQLMutation } from "@/hooks/use-graphql";
import { CREATE_ROLE, UPDATE_ROLE, DELETE_ROLE, SET_ROLE_PERMS } from '../graphql/mutations';
import { GET_ROLES } from "../graphql/queries";

// 获取角色列表
export const useGetRoles = (params: {
  page?: number;
  limit?: number;
  id?: string;
  key?: string;
  name?: string;
  parent?: string;
  status?: string;
  hasRolePerms?: boolean;
} = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ roles: any }, typeof params>(
    GET_ROLES,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );
  
  return { 
    roles: data?.roles, 
    isLoading, 
    error,
    mutate
  };
};

// 创建角色
export const useCreateRole = () => {
  const mutation = useGraphQLMutation<{createRole: any}, {input: {
    key: string;
    parent?: string;
    name: string;
    status?: string;
  }}>(CREATE_ROLE);
  
  return async (params: { 
    key: string;
    parent?: string;
    name: string;
    status?: string;
  }) => {
    const response = await mutation({ 
      input: {
        key: params.key,
        parent: params.parent,
        name: params.name,
        status: params.status
      }
    });
    return response.createRole;
  };
};

// 更新角色
export const useUpdateRole = () => {
  const mutation = useGraphQLMutation<{updateRole: any}, {input: {
    id: string;
    key: string;
    parent?: string;
    name: string;
    status?: string;
  }}>(UPDATE_ROLE);
  
  return async (params: { 
    id: string;
    key: string;
    parent?: string;
    name: string;
    status?: string;
  }) => {
    const response = await mutation({ 
      input: {
        id: params.id,
        key: params.key,
        parent: params.parent,
        name: params.name,
        status: params.status
      }
    });
    return response.updateRole;
  };
};

// 删除角色
export const useDeleteRole = () => {
  const mutation = useGraphQLMutation<{deleteRole: any}, {id: string}>(DELETE_ROLE);
  
  return async (id: string) => {
    const response = await mutation({ id });
    return response.deleteRole;
  };
};

// 设置角色权限
export const useSetRolePerms = () => {
  const mutation = useGraphQLMutation<{setRolePerms: any}, {
    roleId: string;
    permIds: string[];
    module?: string;
  }>(SET_ROLE_PERMS);
  
  return async (input: {
    roleId: string;
    permIds: string[];
    module?: string;
  }) => {
    const response = await mutation(input);
    return response.setRolePerms;
  };
};



