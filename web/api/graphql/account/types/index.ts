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