import { createMutationHook, useGraphQLMutation, useGraphQLQuery } from "@/hooks/use-graphql";
import { GET_ACCOUNTS } from "../queries";
import { CREATE_ACCOUNT, CURRENT_TENANT, DELETE_ACCOUNT, EMAIL_CODE_LOGIN, EMAIL_CODE_LOGIN_SEND, EMAIL_CODE_RESET_PASSWORD_SEND, EMAIL_CODE_SIGNUP, EMAIL_CODE_SIGNUP_SEND, EMAIL_PASSWORD_LOIGN, FORGOT_PASSWORD_CHECK, FORGOT_PASSWORD_RESET, SWITCH_TENANT, TOGGLE_ACCOUNT_STATUS, UPDATE_ACCOUNT, VALIDATE_EMAIL, VALIDATE_USERNAME } from '../mutations/account-mutations';
import { EmailCodeLoginInput, EmailCodeSendInput, EmailCodeSignUpInput, ForgotPasswordCheckInput, ForgotPasswordCheckOutput, ForgotPasswordResetInput, PasswordLoginInput, TenantResponseOutput } from "../types";

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

  if (error?.response?.errors) {
    throw new Error(error?.response?.errors?.[0]?.message || 'Request Error');
  }

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
};

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
);

export const useValidateEmail = createMutationHook<
  { checkLoginEmail: boolean },
  { email: string },
  boolean
>(
  VALIDATE_EMAIL,
  {
    transform: (data) => data.checkLoginEmail
  }
);

export const useEmailCodeSignupSend = createMutationHook<
  { emailCodeSignupSendEmail: string },
  { input: EmailCodeSendInput },
  string
>(
  EMAIL_CODE_SIGNUP_SEND,
  {
    transform: (data) => data.emailCodeSignupSendEmail
  }
);

export const useEmailCodeLoginSend = createMutationHook<
  { emailCodeLoginSendEmail: string },
  { input: EmailCodeSendInput },
  string
>(
  EMAIL_CODE_LOGIN_SEND,
  {
    transform: (data) => data.emailCodeLoginSendEmail
  }
);

export const useEmailCodeResetPasswordSend = createMutationHook<
  { resetPasswordSendEmail: string },
  { input: EmailCodeSendInput },
  string
>(
  EMAIL_CODE_RESET_PASSWORD_SEND,
  {
    transform: (data) => data.resetPasswordSendEmail
  }
);

export const useEmailCodeLogin = createMutationHook<
  { emailCodeLogin: any },
  { input: EmailCodeLoginInput },
  any
>(
  EMAIL_CODE_LOGIN,
  {
    transform: (data) => data.emailCodeLogin
  }
);

export const useEmailPasswordLogin = createMutationHook<
  { emailPasswordLogin: any },
  { input: PasswordLoginInput },
  any
>(
  EMAIL_PASSWORD_LOIGN,
  {
    transform: (data) => data.emailPasswordLogin
  }
);

export const useEmailCodeSignUp = createMutationHook<
  { emailCodeSignUp: any },
  { input: EmailCodeSignUpInput },
  any
>(
  EMAIL_CODE_SIGNUP,
  {
    transform: (data) => data.emailCodeSignUp
  }
);

export const useForgotPasswordCheck = createMutationHook<
  { forgetPasswordTokenCheck: any },
  { input: ForgotPasswordCheckInput },
  ForgotPasswordCheckOutput
>(
  FORGOT_PASSWORD_CHECK,
  {
    transform: (data) => data.forgetPasswordTokenCheck
  }
);

export const useForgotPasswordReset = createMutationHook<
  { forgetPasswordReset: any },
  { input: ForgotPasswordResetInput },
  boolean
>(
  FORGOT_PASSWORD_RESET,
  {
    transform: (data) => data.forgetPasswordReset
  }
);


export const useCurrentTenant = createMutationHook<
  { currentTenant: any },
  {},
  TenantResponseOutput
>(
  CURRENT_TENANT,
  {
    transform: (data) => data.currentTenant
  }
);


export const useSwitchTenant = createMutationHook<
  { switchTenant: any },
  { tenant_id: string },
  TenantResponseOutput
>(
  SWITCH_TENANT,
  {
    transform: (data) => data.switchTenant
  }
);

