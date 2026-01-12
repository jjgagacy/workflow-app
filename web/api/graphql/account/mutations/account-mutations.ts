import { gql } from "graphql-request";
import { LOGIN_RESPONSE_FIELDS } from "../types/fields";

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

export const VALIDATE_EMAIL = gql`
  mutation ValidateEmailMutation($email: String!) {
    checkLoginEmail(email: $email)
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

export const EMAIL_CODE_LOGIN = gql`
  mutation EmailCodeLogin($input: EmailCodeLoginInput!) {
    emailCodeLogin(input: $input) {
      ...LoginResponseParts
    }
  }

  ${LOGIN_RESPONSE_FIELDS}
`

export const EMAIL_PASSWORD_LOIGN = gql`
  mutation EmailPasswordLogin($input: PasswordLoginInput!) {
    emailPasswordLogin(input: $input) {
      ...LoginResponseParts
    }
  }
  
  ${LOGIN_RESPONSE_FIELDS}
`

export const EMAIL_CODE_SIGNUP = gql`
  mutation EmailCodeSignUp($input: EmailCodeSignUpInput!) {
    emailCodeSignUp(input: $input) {
      ...LoginResponseParts
    }
  }

  ${LOGIN_RESPONSE_FIELDS}
`

export const FORGOT_PASSWORD_CHECK = gql`
  mutation ForgotPasswordCheck($input: ForgetPasswordInput!) {
    forgetPasswordTokenCheck(input: $input) {
      isValid,
      token
    }
  }
`

export const FORGOT_PASSWORD_RESET = gql`
  mutation ForgotPasswordReset($input: ForgetPasswordResetInput!) {
    forgetPasswordReset(input: $input)
  }
`