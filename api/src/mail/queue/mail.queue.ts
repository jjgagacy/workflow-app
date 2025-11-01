import { Queue } from "bull";
import { MailSender } from "../sender/mail.sender";
import { LoggerService } from "@nestjs/common";
import { EmailLanguage } from "../templates/mail.i18n";

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

    async sendInviteNumber(to: string, inviterName: string, workspaceName: string, expiryHours: number, invitationUrl: string, language?: EmailLanguage) {
        await this.queue.add('invite_number', {
            to,
            inviterName,
            workspaceName,
            expiryHours,
            invitationUrl,
            language,
        })
    }
}