import { AccountEntity } from "@/account/entities/account.entity";
import { EmailLanguage } from "@/mail/mail-i18n.service";

export interface SendResetPasswordEmailParams {
    email?: string;
    account?: AccountEntity;
    language?: EmailLanguage;
}

export const defaultSendResetPasswordEmailParams: Partial<SendResetPasswordEmailParams> = {
    language: EmailLanguage.ZH_HANS
};

