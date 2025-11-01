import { LoggerService } from "@nestjs/common";
import { MailSender } from "../sender/mail.sender";

export class TemplateMail {
    constructor(
        private readonly mailSender: MailSender,
        private readonly logger: LoggerService,
    ) { }

    async sendWelcome(to: string, context: Record<string, any>, from?: string): Promise<any> {
        return await this.mailSender.send(
            to,
            'Welcome MyApp 🎉',
            { templateName: 'welcome', context },
            from || '',
        );
    }


}