import { Process, Processor } from "@nestjs/bull";
import { MailService } from "./mail.service";
import { Job } from "bull";
import { MailI18nService, EmailLanguage, EmailType } from "./mail-i18n.service";
import { GlobalLogger } from "@/logger/logger.service";
import { ConfigService } from "@nestjs/config";
import configuration from "@/config/configuration";

interface GeneralContext extends Record<string, any> {
  applicationName: string;
  supportsEmail: string;
}

@Processor('mail')
export class MailProcessor {
  private readonly applicationName: string;
  private readonly supportsEmail: string;
  private readonly generalContext: GeneralContext;

  constructor(
    private readonly mailService: MailService,
    private readonly mailI18nService: MailI18nService,
    private readonly logger: GlobalLogger,
    private readonly configService: ConfigService,
  ) {
    this.applicationName = this.configService.get<string>('APPLICATION_NAME', configuration().defaultApplicationName);
    this.supportsEmail = this.configService.get<string>('SYSTEM_SUPPORTS_EMAIL', configuration().systemSupportsEmail);
    this.generalContext = { applicationName: this.applicationName, supportsEmail: this.supportsEmail };
  }

  @Process('welcome')
  async handleSendWelcomeMail(job: Job) {
    const { to, subject, templateName, context } = job.data;
    try {
      await this.mailService.sender.send(to, subject, { templateName, context });
      console.log(`✅ Mail sent to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send mail to ${to}`, error);
      throw error;
    }
  }

  @Process('invite_number')
  async handleInviteNumber(job: Job) {
    const {
      to,
      inviterName,
      workspaceName,
      expiryHours,
      invitationUrl,
      language = EmailLanguage.ZH_HANS,
    } = job.data;

    const emailLanguage = language as EmailLanguage;
    const context = { inviterName, workspaceName, expiryHours, invitationUrl, ...this.generalContext };
    const emailContent = await this.mailI18nService.getEmailContent(EmailType.INVITE_MEMBER, emailLanguage, context);

    if (this.mailService.isHtmlString(emailContent)) {
      throw new Error('Invalid email content type ');
    }
    await this.mailService.sender.send(to, emailContent.subject || '', emailContent);
  }

  @Process('account_deletion_verification')
  async handleAccountDeletionVerification(job: Job) {
    const { to, deletionUrl, expiryMinutes, verificationCode, language = EmailLanguage.ZH_HANS } = job.data;

    const emailLanguage = language as EmailLanguage;
    const emailContent = await this.mailI18nService.getEmailContent(
      EmailType.ACCOUNT_DELETION,
      emailLanguage,
      {
        deletionUrl,
        expiryMinutes,
        verificationCode,
      }
    );

    if (this.mailService.isHtmlString(emailContent)) {
      throw new Error('Invalid email content type ');
    }

    await this.mailService.sender.send(
      to,
      emailContent.subject || '',
      emailContent
    );
  }

  @Process('email_code_login')
  async handleEmailCodeLogin(job: Job) {
    const { to, verificationCode, expiryMinutes, userEmail, requestTime, location, deviceInfo, language = EmailLanguage.ZH_HANS } = job.data;

    const emailLanguage = language as EmailLanguage;
    const emailContent = await this.mailI18nService.getEmailContent(
      EmailType.EMAIL_CODE_LOGIN,
      emailLanguage,
      {
        verificationCode,
        expiryMinutes,
        userEmail,
        requestTime,
        location,
        deviceInfo
      }
    );

    if (this.mailService.isHtmlString(emailContent)) {
      throw new Error('Invalid email content type ');
    }

    await this.mailService.sender.send(
      to,
      emailContent.subject || '',
      emailContent,
    );
  }

  @Process('reset_password')
  async handleResetPassword(job: Job) {
    const { to, resetUrl, expiryMinutes, language = EmailLanguage.ZH_HANS, verificationCode } = job.data;

    const emailLanguage = language as EmailLanguage;
    const emailContent = await this.mailI18nService.getEmailContent(
      EmailType.RESET_PASSWORD,
      emailLanguage,
      {
        resetUrl,
        expiryMinutes,
        verificationCode
      }
    );

    if (this.mailService.isHtmlString(emailContent)) {
      throw new Error('Invalid email content type ');
    }

    await this.mailService.sender.send(
      to,
      emailContent.subject || '',
      emailContent
    );
  }

  @Process('change_email_old')
  async handleChangeEmailOld(job: Job) {
    const { to, verificationCode, expiryMinutes, oldEmail, newEmail, language = EmailLanguage.ZH_HANS } = job.data;

    const emailLanguage = language as EmailLanguage;
    const emailContent = await this.mailI18nService.getEmailContent(
      EmailType.CHANGE_EMAIL_OLD,
      emailLanguage,
      {
        verificationCode,
        expiryMinutes,
        oldEmail,
        newEmail
      }
    );

    if (this.mailService.isHtmlString(emailContent)) {
      throw new Error('Invalid email content type ');
    }

    await this.mailService.sender.send(
      to,
      emailContent.subject || '',
      emailContent,
    );
  }

}
