import { gql } from "graphql-request";

export const LOGIN_MUTATION = gql`
  mutation LoginMutation($input: LoginInput!) {
    login(input: $input) {
      access_token,
      name,
      roles,
      isSuper
    } 
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccountMutation($input: AccountInput!) {
    createAccount(input: $input) {
      id
    } 
  }
`;

export const UPDATE_ACCOUNT = gql`
  mutation UpdateAccountMutation($input: AccountInput!) {
    updateAccount(input: $input) {
      id
    } 
  }
`;

export const UPDATE_ACCOUNT_PASSWORD = gql`
  mutation UpdateAccountPasswordMutation($password: String!, $newPassword: String!) {
    updateAccountPassword(password: $password, newPassword: $newPassword)
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccountMutation($id: Int!) {
    deleteAccount(id: $id)
  }
`;

export const TOGGLE_ACCOUNT_STATUS = gql`
  mutation ToggleAccountStatusMutation($id: Int!) {
    toggleAccountStatus(id: $id)
  }
`;

export const VALIDATE_USERNAME = gql`
  mutation ValidateUsernameMutation($username: String!) {
    checkSignUpUsername(username: $username)
  }
`

export const EMAIL_CODE_SIGNUP_SEND = gql`
  mutation EmailCodeSignupSend($input: EmailCodeLoginSendEmail!) {
    emailCodeSignupSendEmail(input: $input)
  }
`

export const EMAIL_CODE_LOGIN_SEND = gql`
  mutation EmailCodeLoginSend($input: EmailCodeLoginSendEmail!) {
    emailCodeLoginSendEmail(input: $input)
  }
`

export const EMAIL_CODE_RESET_PASSWORD_SEND = gql`
  mutation EmailCodeResetPasswordSend($input: ResetPasswordSendEmailInput!) {
    resetPasswordSendEmail(input: $input)
  }
`