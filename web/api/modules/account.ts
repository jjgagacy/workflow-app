import { useGraphQLMutation, useGraphQLQuery } from "@/hooks/use-graphql";
import { GET_ACCOUNTS } from "../graphql/queries";
import { CREATE_ACCOUNT, DELETE_ACCOUNT, UPDATE_ACCOUNT } from "../graphql/mutations";

// 获取账户列表
export const useGetAccounts = (params: {
  page?: number;
  limit?: number;
  id?: string;
  username?: string;
  realName?: string;
  email?: string;
  mobile?: string;
  roleId?: string;
} = {}) => {
  const { data, error, isLoading } = useGraphQLQuery<{ accounts: any }, typeof params>(
    GET_ACCOUNTS,
    params,
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );
  
  return { 
    accounts: data?.accounts, 
    isLoading, 
    error 
  };
};

// 创建账户
export const useCreateAccount = () => {
  const mutation = useGraphQLMutation<{createAccount: any}, { input: { username: string; password: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any} }>(CREATE_ACCOUNT);
  
  return async (params: { username: string; password: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any }) => {
    const { username, password, realName, mobile, email, roles, status } = params;
    const response = await mutation({ input: { username, password, realName, mobile, email, roles, status }});
    return response.createAccount;
  };
};

// 更新账户
export const useUpdateAccount = () => {
  const mutation = useGraphQLMutation<{updateAccount: any}, {input: { id: string; username?: string; password?: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any}}>(UPDATE_ACCOUNT);
  
  return async (params: { id: string; username?: string; password?: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any }) => {
    const { id, username, password, realName, mobile, email, roles, status } = params;
    const response = await mutation({ input: { id, username, password, realName, mobile, email, roles, status } });
    return response.updateAccount;
  };
};

// 删除账户
export const useDeleteAccount = () => {
  const mutation = useGraphQLMutation<{deleteAccount: any}, {id: string}>(DELETE_ACCOUNT);
  
  return async (id: string) => {
    const response = await mutation({ id });
    return response.deleteAccount;
  };
};