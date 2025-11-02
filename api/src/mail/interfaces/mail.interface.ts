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
    expiryMinutes: string;
    verificationCode: string;
    language?: EmailLanguage;
}

export interface EmailCodeLoginOptions {
    to: string;
    verificationCode: string;
    expiryMinutes: string;
    userEmail: string;
    requestTime: string;
    location?: string;
    deviceInfo?: string;
    language?: EmailLanguage;
}

export interface ResetPasswordOptions {
    to: string;
    resetUrl: string;
    expiryMinutes: string;
    language?: EmailLanguage;
}

export interface ChangeEmailOldOptions {
    to: string;
    verificationCode: string;
    expiryMinutes: string;
    oldEmail: string;
    newEmail: string;
    language?: EmailLanguage;
}
