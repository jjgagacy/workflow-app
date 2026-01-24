import { EmailLanguage } from "../mail-i18n.service";

export interface InviteMumberOptions {
  to: string;
  inviterName: string;
  workspaceName: string;
  invitationUrl: string;
  expiryHours?: number;
  language?: EmailLanguage;
}

export interface AccountDeletionOptions {
  to: string;
  expiryMinutes: number;
  verificationCode: string;
  language?: EmailLanguage;
}

export interface EmailCodeLoginOptions {
  to: string;
  verificationCode: string;
  expiryMinutes: number;
  userEmail: string;
  requestTime: string;
  location?: string;
  deviceInfo?: string;
  language?: EmailLanguage;
}

export interface ResetPasswordOptions {
  to: string;
  resetUrl?: string; // todo
  expiryMinutes: number;
  language?: EmailLanguage;
  code: string;
}

export interface ChangeEmailOldOptions {
  to: string;
  verificationCode: string;
  expiryMinutes: number;
  language?: EmailLanguage;
}

export interface ConfirmEmailNewOptions {
  to: string;
  verificationCode: string;
  expiryMinutes: number;
  oldEmail: string;
  newEmail: string;
  language?: EmailLanguage;
}

