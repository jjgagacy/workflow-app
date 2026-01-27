export interface EmailCodeSendInput {
  email: string;
  language?: string;
}

export interface EmailCodeLoginInput {
  email: string;
  code: string;
  token: string;
}

export interface EmailCodeSignUpInput extends EmailCodeLoginInput {
  username: string;
}

export interface ForgotPasswordCheckInput {
  email: string;
  token: string;
  code: string;
  language?: string;
}

export interface ForgotPasswordCheckOutput {
  isValid: boolean;
  token: string; // new token
}

export interface ForgotPasswordResetInput {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export interface PasswordLoginInput {
  email: string;
  password: string;
  token?: string;
}

export interface TenantResponseOutput {
  tenant_id: string;
  name: string;
  plan: string;
}

export interface UpdateAccountAvatarInput {
  avatar: string;
}

export interface UpdateAccountUsernameInput {
  username: string;
}

export interface ChangeEmailOldInput {
  language?: string;
}

export interface ConfirmEmailNewInput {
  token: string;
  newEmail: string;
  code: string;
  language?: string;
}

export interface UpdateAccountNewEmailInput {
  token: string;
  newEmail: string;
  code: string;
  language?: string;
}

export interface ValidateChangeEmailOldInput {
  token: string;
  code: string;
}

export interface DeleteAccountEmailSendInput {
  language?: string;
}
