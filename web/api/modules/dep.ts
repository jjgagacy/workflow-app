// services/departmentService.ts
import { useGraphQLQuery, useGraphQLMutation } from "@/hooks/use-graphql";
import { CREATE_DEP, UPDATE_DEP, DELETE_DEP } from '../graphql/mutations';
import { GET_DEP, GET_DEPS } from '../graphql/queries';

// 获取部门列表
export const useGetDeps = (params: { key?: string; name?: string; parent?: string } = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ deps: any }, { input: typeof params }>(
    GET_DEPS,
    { input: params },
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );
  
  return { 
    deps: data?.deps, 
    isLoading, 
    error,
    mutate
  };
};

// 获取部门详情
export const useGetDepInfo = ({ key }: { key: string }) => {
  const { data, error, isLoading } = useGraphQLQuery<{depInfo: any}, { key: string}>(
    GET_DEP,
    { key },
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    dep: data?.depInfo,
    isLoading,
    error
  };
}

// 创建部门
export const useCreateDep = () => {
  const mutation = useGraphQLMutation<{createDep: any}, { input: { key: string; name: string; parent?: string; remarks?: string; managerId?: string}}>(CREATE_DEP);
  
  return async (params: { key: string; name: string; parent?: string; remarks?: string; managerId?: string }) => {
    const { key, name, parent, remarks, managerId } = params;
    const response = await mutation({ input: { key, name, parent, remarks, managerId } });
    return response.createDep;
  };
};

// 更新部门
export const useUpdateDep = () => {
  const mutation = useGraphQLMutation<{updateDep: any}, { input: { key: string; name: string; parent?: string; remarks?: string; managerId?: string}}>(UPDATE_DEP);
  
  return async (params: { key: string; name: string; parent?: string; remarks?: string; managerId?: string }) => {
    const { key, name, parent, remarks, managerId } = params;
    const response = await mutation({ input: { key, name, parent, remarks, managerId } });
    return response.updateDep;
  };
};

// 删除部门
export const useDeleteDep = () => {
  const mutation = useGraphQLMutation<{deleteDep: any}, {id: number}>(DELETE_DEP);
  
  return async (id: number) => {
    const response = await mutation({ id });
    return response.deleteDep;
  };
};
