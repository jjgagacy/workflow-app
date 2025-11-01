import { toBoolean } from "@/monie/helpers/to-boolean";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bull";
import { GlobalLogger } from "@/logger/logger.service";
import { EmailContent, MailClient, TemplateFile } from "./interfaces/client.interface";
import { ResendClient } from "./clients/resend.client";
import { SMTPClient } from "./clients/smtp.client";
import { MailSender } from "./sender/mail.sender";
import { MailQueue } from "./queue/mail.queue";
import { TemplateMail } from "./templates/mail.template";

@Injectable()
export class MailService implements OnModuleInit {
    private client: MailClient | null = null;
    private readonly mailType: string;
    private readonly defaultSendFrom: string;

    public readonly sender: MailSender;
    public readonly queue: MailQueue;
    public readonly template: TemplateMail;

    constructor(
        @InjectQueue('mail') private readonly mailQueue: Queue,
        private readonly configService: ConfigService,
        private readonly logger: GlobalLogger,
    ) {
        this.mailType = configService.get<string>('MAIL_TYPE', 'smtp');
        this.defaultSendFrom = configService.get<string>('MAIL_DEFAULT_SEND_FROM', '');
        this.sender = new MailSender({
            client: null as any,
            defaultSendFrom: this.defaultSendFrom,
            logger: this.logger,
        });
        this.queue = new MailQueue(this.mailQueue, this.sender, this.logger);
        this.template = new TemplateMail(this.sender, this.logger);
    }

    async onModuleInit() {
        await this.initMailClient();
        if (this.client) {
            this.sender.setClient(this.client);
        }
    }

    private async initMailClient(): Promise<void> {
        try {
            switch (this.mailType) {
                case 'resend':
                    await this.initResendClient();
                    break;
                case 'smtp':
                    await this.initSMTPClient();
                    break;
                default:
                    throw new Error(`Unsupported mail type: ${this.mailType}`);
            }
            this.logger.log(`Mail client initialized successfully with type: ${this.mailType}`);
        } catch (error) {
            this.logger.error(`Failed to initialized mail client: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async initResendClient(): Promise<void> {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not set');
        }
        const apiUrl = this.configService.get<string>('RESEND_API_URL');
        this.client = new ResendClient(apiKey, apiUrl);
    }

    private async initSMTPClient(): Promise<void> {
        const host = this.configService.get<string>('SMTP_SERVER', '');
        const port = parseInt(this.configService.get<string>('SMTP_PORT', ''));
        if (host === '' || isNaN(port)) {
            throw new Error('SMTP host and port are required for SMTP mail type');
        }

        const useTlsConfig = this.configService.get<string>('SMTP_USE_TLS', '');
        const opportunisticTls = this.configService.get<string>('SMTP_OPPORTUNISTIC_TLS', '');

        this.client = new SMTPClient({
            host,
            port,
            username: this.configService.get<string>('SMTP_USERNAME', ''),
            password: this.configService.get<string>('SMTP_PASSWORD', ''),
            ...(useTlsConfig !== '' && { useTls: toBoolean(useTlsConfig) }),
            ...(opportunisticTls !== '' && { opportunisticTls: toBoolean(opportunisticTls) }),
        });

        await this.testSMTPConnection();
    }

    private async testSMTPConnection(): Promise<void> {
        if (this.client instanceof SMTPClient) {
            try {
                await (this.client as SMTPClient).verify();
            } catch (error) {
                this.logger.error(`SMTP connection verification failed: ${error.message}`, error.stack);
                throw error;
            }
        }
    }

    isInited(): boolean {
        return this.client !== null;
    }

    isTemplateFile(content: EmailContent): content is TemplateFile {
        return typeof content === 'object' &&
            content !== null &&
            'templateName' in content &&
            'context' in content;
    }

    isHtmlString(content: EmailContent): content is string {
        return typeof content === 'string';
    }

}