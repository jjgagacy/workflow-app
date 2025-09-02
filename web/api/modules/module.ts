// services/moduleService.ts
import { useGraphQLQuery, useGraphQLMutation } from "@/hooks/use-graphql";
import {
  CREATE_MODULE,
  UPDATE_MODULE,
  DELETE_MODULE,
  CREATE_MODULE_PERM,
  UPDATE_MODULE_PERM,
  DELETE_MODULE_PERM
} from '../graphql/mutations';
import { GET_MODULES } from "../graphql/queries";

// 获取模块列表
export const useGetModules = (params: {
  page?: number;
  limit?: number;
  key?: string;
  name?: string;
} = {}) => {
  const { data, error, isLoading, mutate} = useGraphQLQuery<{ modules: any }, typeof params>(
    GET_MODULES,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return { 
    modules: data?.modules, 
    isLoading, 
    error,
    mutate
  };
};

// 创建模块
export const useCreateModule = () => {
  const mutation = useGraphQLMutation<{createModule: any}, {input: {
    key: string;
    name: string;
  }}>(CREATE_MODULE);
  
  return async (params: { key: string; name: string }) => {
    const response = await mutation({ 
      input: {
        key: params.key,
        name: params.name
      }
    });
    return response.createModule;
  };
};

// 更新模块
export const useUpdateModule = () => {
  const mutation = useGraphQLMutation<{updateModule: any}, {input: {
    id: number;
    key: string;
    name: string;
  }}>(UPDATE_MODULE);
  
  return async (params: { id: number; key: string; name: string }) => {
    const response = await mutation({ 
      input: {
        id: params.id,
        key: params.key,
        name: params.name
      }
    });
    return response.updateModule;
  };
};

// 删除模块
export const useDeleteModule = () => {
  const mutation = useGraphQLMutation<{deleteModule: any}, {id: number}>(DELETE_MODULE);
  
  return async (id: number) => {
    const response = await mutation({ id });
    return response.deleteModule;
  };
};

// 创建模块权限
export const useCreateModulePerm = () => {
  const mutation = useGraphQLMutation<{createPerm: any}, {input: {
    module: string;
    key: string;
    name: string;
    restrictLevel?: number;
  }}>(CREATE_MODULE_PERM);
  
  return async (params: { 
    module: string;
    key: string;
    name: string;
    restrictLevel?: number;
  }) => {
    const response = await mutation({ 
      input: {
        module: params.module,
        key: params.key,
        name: params.name,
        restrictLevel: params.restrictLevel
      }
    });
    return response.createPerm;
  };
};

// 更新模块权限
export const useUpdateModulePerm = () => {
  const mutation = useGraphQLMutation<{updatePerm: any}, {input: {
    module: string;
    key: string;
    name: string;
    restrictLevel?: number;
  }}>(UPDATE_MODULE_PERM);
  
  return async (params: { 
    module: string;
    key: string;
    name: string;
    restrictLevel?: number;
  }) => {
    const response = await mutation({ 
      input: {
        module: params.module,
        key: params.key,
        name: params.name,
        restrictLevel: params.restrictLevel
      }
    });
    return response.updatePerm;
  };
};

// 删除模块权限
export const useDeleteModulePerm = () => {
  const mutation = useGraphQLMutation<{deletePerm: any}, {input: {
    module: string;
    key: string;
  }}>(DELETE_MODULE_PERM);
  
  return async (params: { module: string; key: string }) => {
    const response = await mutation({ 
      input: {
        module: params.module,
        key: params.key
      }
    });
    return response.deletePerm;
  };
};