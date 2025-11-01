import { Process, Processor } from "@nestjs/bull";
import { MailService } from "./mail.service";
import { Job } from "bull";
import { EmailContent } from "./interfaces/client.interface";
import { MailI18nService, EmailLanguage, EmailType } from "./templates/mail.i18n";
import { GlobalLogger } from "@/logger/logger.service";

@Processor('mail')
export class MailProcessor {
    constructor(
        private readonly mailService: MailService,
        private readonly mailI18nService: MailI18nService,
        private readonly logger: GlobalLogger,
    ) { }

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
        const { to,
            inviterName,
            workspaceName,
            expiryHours,
            invitationUrl,
            language } = job.data;
        try {
            const emailLanguage = language as EmailLanguage;
            const context = { inviterName, workspaceName, expiryHours, invitationUrl };
            const emailContent = await this.mailI18nService.getEmailContent(EmailType.INVITE_MEMBER, emailLanguage, context);

            if (this.mailService.isHtmlString(emailContent)) {
                throw new Error(
                    'Invalid email content type. Expected TemplateFile bug received string.\n' +
                    'Please provide a template configuation object with templateName and contet.'
                );
            }
            await this.mailService.sender.send(to, emailContent.subject || '', emailContent);
        } catch (error) {
            this.logger.error(`Process invite number send mail error: ${error.message}`, error.stack);
            throw error;
        }
    }
}
