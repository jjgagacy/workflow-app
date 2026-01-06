import { createMutationHook, useGraphQLMutation, useGraphQLQuery } from "@/hooks/use-graphql";
import { GET_ACCOUNTS } from "../../queries";
import { CREATE_ACCOUNT, DELETE_ACCOUNT, EMAIL_CODE_SIGNUP_SEND, TOGGLE_ACCOUNT_STATUS, UPDATE_ACCOUNT, VALIDATE_USERNAME } from '../mutations/account-mutations';
import { EmailCodeSendInput } from "../types";

// 获取账户列表
export const useGetAccounts = (params: {
  page?: number;
  limit?: number;
  id?: number;
  username?: string;
  realName?: string;
  email?: string;
  mobile?: string;
  roleId?: string;
} = {}) => {
  const { data, error, isLoading, mutate } = useGraphQLQuery<{ accounts: any }, typeof params>(
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
    error,
    mutate
  };
};

// 创建账户
export const useCreateAccount = () => {
  const mutation = useGraphQLMutation<{ createAccount: any }, { input: { username: string; password: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any } }>(CREATE_ACCOUNT);

  return async (params: { username: string; password: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any }) => {
    const { username, password, realName, mobile, email, roles, status } = params;
    const response = await mutation({ input: { username, password, realName, mobile, email, roles, status } });
    return response.createAccount;
  };
};

// 更新账户
export const useUpdateAccount = () => {
  const mutation = useGraphQLMutation<{ updateAccount: any }, { input: { id: number; username?: string; password?: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any } }>(UPDATE_ACCOUNT);

  return async (params: { id: number; username?: string; password?: string; realName?: string; mobile?: string; email?: string; roles?: any; status?: any }) => {
    const { id, username, password, realName, mobile, email, roles, status } = params;
    const response = await mutation({ input: { id, username, password, realName, mobile, email, roles, status } });
    return response.updateAccount;
  };
};

// 删除账户
export const useDeleteAccount = () => {
  const mutation = useGraphQLMutation<{ deleteAccount: any }, { id: number }>(DELETE_ACCOUNT);

  return async (id: number) => {
    const response = await mutation({ id });
    return response.deleteAccount;
  };
};

// 修改账户状态
export const useToggleAccountStatus = () => {
  const mutation = useGraphQLMutation<{ toggleAccountStatus: any }, { id: number }>(TOGGLE_ACCOUNT_STATUS);

  return async (id: number) => {
    const response = await mutation({ id });
    return response.toggleAccountStatus;
  };
}

// validate username
export const useValidateUsername = createMutationHook<
  { checkSignUpUsername: boolean },
  { username: string },
  boolean
>(
  VALIDATE_USERNAME,
  {
    transform: (data) => data.checkSignUpUsername
  }
)

export const useEmailCodeSignupSend = createMutationHook<
  { emailCodeSignupSendEmail: string },
  { input: EmailCodeSendInput },
  string
>(
  EMAIL_CODE_SIGNUP_SEND,
  {
    transform: (data) => data.emailCodeSignupSendEmail
  }
)