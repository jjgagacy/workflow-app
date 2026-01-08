export interface EmailCodeSendInput {
  email: string;
  language: string;
}

export interface EmailCodeLoginInput {
  email: string;
  code: string;
  token: string;
}

export interface EmailCodeSignUpInput extends EmailCodeLoginInput {
  username: string;
}

