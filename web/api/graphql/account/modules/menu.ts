// services/menuService.ts
import { useGraphQLQuery, useGraphQLMutation } from "@/hooks/use-graphql";
import { Menu } from "@/features/menu/components/data";
import { GET_MENUS, GET_MENUS2 } from "../../queries";
import { CREATE_MENU, UPDATE_MENU, DELETE_MENU } from "../mutations/role-mutations";

// 获取菜单列表 (GET_MENUS)
export const useGetMenus = (params: {
  key?: string;
  name?: string;
  parent?: string;
  status?: string;
  module?: boolean;
  scope?: boolean;
  modulePerm?: boolean;
} = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ menus: any }, typeof params>(
    GET_MENUS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    menus: data?.menus as Menu[],
    isLoading,
    error,
    mutate
  };
};

// 获取菜单列表 (GET_MENUS2)
export const useGetMenus2 = (params: {
  key?: string;
  name?: string;
  parent?: string;
  status?: string;
} = {}) => {
  const { data, error, isLoading } = useGraphQLQuery<{ menus: any }, typeof params>(
    GET_MENUS2,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    menus: data?.menus,
    isLoading,
    error
  };
};

// 创建菜单
export const useCreateMenu = () => {
  const mutation = useGraphQLMutation<{ createMenu: any }, {
    input: {
      key: string;
      parent?: string;
      name: string;
      status?: number;
      sort?: number;
      moduleId?: number;
    }
  }>(CREATE_MENU);

  return async (params: {
    key: string;
    parent?: string;
    name: string;
    status?: number;
    sort?: number;
    moduleId?: number;
  }) => {
    const response = await mutation({
      input: {
        key: params.key,
        parent: params.parent,
        name: params.name,
        status: params.status,
        sort: params.sort,
        moduleId: params.moduleId
      }
    });
    return response.createMenu;
  };
};

// 更新菜单
export const useUpdateMenu = () => {
  const mutation = useGraphQLMutation<{ updateMenu: any }, {
    input: {
      key: string;
      parent?: string;
      name: string;
      status?: number;
      sort?: number;
      moduleId?: string;
    }
  }>(UPDATE_MENU);

  return async (params: {
    key: string;
    parent?: string;
    name: string;
    status?: number;
    sort?: number;
    moduleId?: string;
  }) => {
    const response = await mutation({
      input: {
        key: params.key,
        parent: params.parent,
        name: params.name,
        status: params.status,
        sort: params.sort,
        moduleId: params.moduleId
      }
    });
    return response.updateMenu;
  };
};

// 删除菜单
export const useDeleteMenu = () => {
  const mutation = useGraphQLMutation<{ deleteMenu: any }, { id: number }>(DELETE_MENU);

  return async (id: number) => {
    const response = await mutation({ id });
    return response.deleteMenu;
  };
};

