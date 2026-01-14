import { createQueryHook, useGraphQLMutation, useGraphQLQuery } from "@/hooks/use-graphql";
import { LOGIN_MUTATION, UPDATE_ACCOUNT_PASSWORD } from "../mutations/account-mutations";
import { CURRENT_TENANT, GET_ACCOUNT_INFO } from "../queries";
import { TenantResponseOutput } from "../types";

// 登录函数（变更操作）
export const useLogin = () => {
  const mutation = useGraphQLMutation<{ login: any }, { input: { username: string; password: string } }>(LOGIN_MUTATION);

  return async (username: string, password: string) => {
    const response = await mutation({ input: { username, password } });
    return response.login;
  };
};

// 更新密码（变更操作）
export const useUpdatePassword = () => {
  const mutation = useGraphQLMutation<{ updateAccountPassword: any }, {
    password: string;
    newPassword: string
  }>(UPDATE_ACCOUNT_PASSWORD);

  return async ({ password, newPassword }: { password: string; newPassword: string }) => {
    const response = await mutation({ password, newPassword });
    return response.updateAccountPassword;
  };
};

// 获取账户信息（查询操作）
export const useAccountInfo = () => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ accountInfo: any }, {}>(
    GET_ACCOUNT_INFO,
    {},
    {
      shouldRetryOnError: false,
      revalidateOnReconnect: true
    }
  );

  return {
    accountInfo: data?.accountInfo,
    isLoading,
    error,
    mutate
  };
};

export const useCurrentTenant = createQueryHook<
  { currentTenant: any },
  {},
  TenantResponseOutput
>(
  CURRENT_TENANT,
  {
    transform: (data) => data?.currentTenant,
  }
);
