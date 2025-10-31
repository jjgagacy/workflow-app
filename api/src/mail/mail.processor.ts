import { Process, Processor } from "@nestjs/bull";
import { MailService } from "./mail.service";
import { Job } from "bull";

@Processor('mail')
export class MailProcessor {
    constructor(
        private readonly mailService: MailService
    ) { }

    @Process('welcome-signal')
    async handleSendWelcomeMail(job: Job) {
        const { to, subject, templateName, context } = job.data;
        try {
            await this.mailService.sendMailByTemplate(to, subject, templateName, context);
            console.log(`✅ Mail sent to ${to}`);
        } catch (error) {
            console.error(`❌ Failed to send mail to ${to}`, error);
        }
    }
}
