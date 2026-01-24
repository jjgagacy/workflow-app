import { Queue } from "bull";
import { MailSender } from "../sender/mail.sender";
import { LoggerService } from "@nestjs/common";
import { EmailLanguage } from "../mail-i18n.service";
import { AccountDeletionOptions, ChangeEmailOldOptions, ConfirmEmailNewOptions, EmailCodeLoginOptions, InviteMumberOptions, ResetPasswordOptions } from "../interfaces/mail.interface";

export class MailQueue {
  constructor(
    private readonly queue: Queue,
    private readonly sender: MailSender,
    private readonly logger: LoggerService,
  ) { }

  async sendWelcome(to: string, context: Record<string, any>) {
    await this.queue.add('welcome', {
      to,
      subject: 'Welcome MyApp 🎉',
      templateName: 'welcome.hbs',
      context
    });
  }

  async sendInviteNumber(options: InviteMumberOptions) {
    const {
      to,
      inviterName,
      workspaceName,
      invitationUrl,
      expiryHours = 24,
      language = EmailLanguage.ZH_HANS
    } = options;

    await this.queue.add('invite_number', {
      to,
      inviterName,
      workspaceName,
      expiryHours,
      invitationUrl,
      language,
    })
  }

  async sendAccountDeletion(options: AccountDeletionOptions) {
    const {
      to,
      expiryMinutes,
      language = EmailLanguage.ZH_HANS,
      verificationCode
    } = options;

    await this.queue.add('account_deletion_verification', {
      to,
      expiryMinutes,
      language,
      verificationCode
    });
  }

  async sendResetPassword(options: ResetPasswordOptions) {
    const {
      to,
      resetUrl,
      expiryMinutes,
      language = EmailLanguage.ZH_HANS,
      code: verificationCode,
    } = options;

    await this.queue.add('reset_password', {
      to,
      resetUrl,
      expiryMinutes,
      language,
      verificationCode,
    });
  }

  async sendChangeEmailOld(options: ChangeEmailOldOptions) {
    const {
      to,
      verificationCode,
      expiryMinutes,
      language = EmailLanguage.ZH_HANS
    } = options;

    await this.queue.add('change_email_old', {
      to,
      verificationCode,
      expiryMinutes,
      language
    });
  }

  async sendConfirmEmailNew(options: ConfirmEmailNewOptions) {
    const {
      to,
      verificationCode,
      expiryMinutes,
      oldEmail,
      newEmail,
      language = EmailLanguage.ZH_HANS
    } = options;

    await this.queue.add('confirm_email_new', {
      to,
      verificationCode,
      expiryMinutes,
      oldEmail,
      newEmail,
      language
    });
  }

  async sendEmailCodeLogin(options: EmailCodeLoginOptions) {
    const {
      to,
      verificationCode,
      expiryMinutes,
      userEmail,
      requestTime,
      location = 'Unknown',
      deviceInfo = 'Unknown Device',
      language = EmailLanguage.ZH_HANS
    } = options;

    await this.queue.add('email_code_login', {
      to,
      verificationCode,
      expiryMinutes,
      userEmail,
      requestTime,
      location,
      deviceInfo,
      language
    });
  }
}