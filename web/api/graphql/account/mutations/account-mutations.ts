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

export const REMOVE_ACCOUNT = gql`
  mutation RemoveAccountMutation($id: Int!) {
    removeAccount(id: $id)
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
export const CURRENT_TENANT = gql`
  mutation CurrentTenantMutation {
    currentTenant {
      tenant_id,
      name,
      plan
    }
  }
`

export const SWITCH_TENANT = gql`
  mutation SwitchTenantMutation($tenant_id: String!) {
    switchTenant {
      tenant_id,
      name,
      plan
    }
  }
`

export const UPDATE_ACCOUNT_AVATAR = gql`
  mutation UpdateAccountAvatarMutation($input: UpdateAccountAvatarInput!) {
    updateAccountAvatar(input: $input)
  }
`

export const UPDATE_ACCOUNT_NAME = gql`
  mutation UpdateAccountNameMutation($input: UpdateAccountNameInput!) {
    updateAccountName(input: $input)
  }
`

export const CHANGE_EMAIL_OLD_SEND = gql`
  mutation ChangeEmailOldSendMutation($input: ChangeEmailSendInput!) {
    changeEmailOldSend(input: $input)
  }
`

export const CONFIRM_EMAIL_NEW_SEND = gql`
  mutation ConfirmEmailNewSendMutation($input: ConfirmEmailNewInput!) {
      confirmEmailNewSend(input: $input)
  }
`

export const UPDATE_ACCOUNT_NEW_EMAIL = gql`
  mutation UpdateAccountNewEmailMutation($input: UpdateAccountNewEmailInput!) {
    updateAccountNewEmail(input: $input)
  }
`

export const VALIDATE_CHANGE_EMAIL_OLD = gql`
  mutation ValidateChangeEmailOldMutation($input: ValidateChangeEmailOldInput!) {
    validateChangeEmailOld(input: $input)
  }
`

export const DELETE_ACCOUNT_EMAIL_SEND = gql`
  mutation DeleteAccountEmailSendMutation($input: DeleteAccountEmailSendInput!) {
    deleteAccountEmailSend(input: $input)
  }
`

export const VALIDATE_DELETE_ACCOUNT_CODE = gql`
  mutation ValidateDeleteAccountCodeMutation($input: ValidateDeleteAccountCodeInput!) {
    validateDeleteAccountEmailCode(input: $input)
  }
`

export const INVITE_TOKEN_CHECK = gql`
  mutation InviteTokenCheckMutation($token: String!) {
    inviteTokenCheck(token: $token) {
      inviteeEmail,
      inviteeName,
      workspaceId,
      workspaceName
    }
  }
`;

export const INVITE_MEMBER_ACTIVATION = gql`
  mutation InviteMemberActivationMutation($input: InviteMemberActivationInput!) {
    inviteMemberActivation(input: $input)
  }
`;

export const UPDATE_ACCOUNT_LANGUAGE = gql`
  mutation UpdateAccountLanguageMutation($input: UpdateAccountLanguageInput!) {
    updateAccountLanguage(input: $input)
  }
`

export const UPDATE_ACCOUNT_THEME = gql`
  mutation UpdateAccountThemeMutation($input: UpdateAccountThemeInput!) {
    updateAccountTheme(input: $input)
  }
`

export const UPDATE_ACCOUNT_APPEARANCE = gql`
  mutation UpdateAccountAppearanceMutation($appearance: String!) {
    updateAccountAppearance(appearance: $appearance)
  }
`

export const UPDATE_ACCOUNT_TIMEZONE = gql`
  mutation UpdateAccountTimezoneMutation($timezone: String!) {
    updateAccountTimezone(timezone: $timezone)
  }
`

