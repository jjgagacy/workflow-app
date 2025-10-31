import { toBoolean } from "@/monie/helpers/to-boolean";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bull";
import { readFileSync } from "fs";
import { join } from "path";
import * as handlebars from 'handlebars';
import { GlobalLogger } from "@/logger/logger.service";
import { EmailContent, MailClient, TemplateFile } from "./interfaces/client.interface";
import { ResendClient } from "./clients/resend.client";
import { SMTPClient } from "./clients/smtp.client";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MailService implements OnModuleInit {
    private client: MailClient | null = null;
    private readonly mailType: string;
    private readonly defaultSendFrom: string;

    constructor(
        @InjectQueue('mail') private readonly mailQueue: Queue,
        private readonly configService: ConfigService,
        private readonly logger: GlobalLogger,
    ) {
        this.mailType = configService.get<string>('MAIL_TYPE', 'smtp');
        this.defaultSendFrom = configService.get<string>('MAIL_DEFAULT_SEND_FROM', '');
    }

    async onModuleInit() {
        await this.initMailClient();
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

    async sendWelcome(to: string, subject: string, templateName: string, context: Record<string, any>) {
        await this.mailQueue.add('welcome-signal', { to, subject, templateName, context });
    }

    private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
        try {
            const templatePath = join(__dirname, '../../mail/templates', `${templateName}.hbs`);
            const source = readFileSync(templatePath, 'utf-8');
            const compiledTemplate = handlebars.compile(source);
            return compiledTemplate(context);
        } catch (error) {
            this.logger.log(`Failed to render template: ${templateName}: ${error.message}`, error.stack);
            throw new Error(`Template ${templateName} not found or invalid`);
        }
    }

    async send(to: string, subject: string, content: EmailContent, from: string) {
        if (!this.client) {
            throw new Error('Mail client is not initialized');
        }
        const requestId = uuidv4();
        const startTime = Date.now();

        let html: string;
        let templateInfo: { templateName?: string; context?: Record<string, any> } = {};

        if (typeof content === 'string') {
            html = content;
        } else {
            html = await this.renderTemplate(content.templateName, content.context);
            templateInfo = content;
        }
        const htmlLength = html.length;
        this.logSendAttempt({ requestId, to, from, subject, htmlLength, templateName: templateInfo.templateName, context: templateInfo.context, timestamp: new Date().toISOString() });

        try {
            const result = await this.client.send({
                from,
                to,
                subject,
                html,
            });
            this.logSendSuccessfully({ requestId, to, from, subject, htmlLength, duration: Date.now() - startTime, messageId: result.messageId, response: result.response });
        } catch (error) {
            this.logSendError({ requestId, to, from, subject, htmlLength, duration: Date.now() - startTime, error: error.message, stack: error.stack });
        }
    }

    async sendMailByTemplate(to: string, subject: string, templateName: string, context: Record<string, any>) {
        const from = context.from || this.defaultSendFrom;
        return await this.send(to, subject, { templateName, context }, from);
    }

    private isTemplateFile(content: EmailContent): content is TemplateFile {
        return typeof content === 'object' &&
            content !== null &&
            'templateName' in content &&
            'context' in content;
    }

    private isHtmlString(content: EmailContent): content is string {
        return typeof content === 'string';
    }

    private logSendAttempt(details: {
        requestId: string;
        to: string;
        from: string;
        subject: string;
        htmlLength: number;
        templateName?: string;
        context?: Record<string, any>;
        timestamp: string;
    }): void {
        this.logger.log('Starting to send mail', {
            action: 'SEND_ATTEMPT',
            requestid: details.requestId,
            recipient: details.to,
            sender: details.from,
            subject: details.subject,
            content: {
                htmlLength: details.htmlLength,
                template: details.templateName,
                ...(details.context && { context: this.sanitizeContext(details.context) })
            },
            timestamp: details.timestamp
        });
    }

    private logSendSuccessfully(details: {
        requestId: string;
        to: string;
        from: string;
        subject: string;
        htmlLength: number;
        duration: number;
        messageId?: string;
        response?: string;
    }): void {
        this.logger.log('Email sent successfull', {
            action: 'QUEUE_PROCESS_SUCCESS',
            requestid: details.requestId,
            recipient: details.to,
            sender: details.from,
            subject: details.subject,
            timestamp: new Date().toISOString(),
            content: {
                htmlLength: details.htmlLength,
            },
            duration: details.duration,
            result: {
                messageId: details.messageId,
                response: details.response,
            },
        });
    }

    private logSendError(details: {
        requestId: string;
        to: string;
        from: string;
        subject: string;
        htmlLength: number;
        duration: number;
        error: string;
        stack: string;
    }): void {
        this.logger.log('Email sent failed', {
            action: 'QUEUE_PROCESS_FAIL',
            requestId: details.requestId,
            recipient: details.to,
            sender: details.from,
            subject: details.subject,
            timestamp: new Date().toISOString(),
            content: {
                htmlLength: details.htmlLength,
            },
            duration: details.duration,
            error: details.error,
            stack: details.stack,
        });
    }

    private sanitizeContext(context: Record<string, any>): Record<string, any> {
        const sanitized = { ...context };
        const sanitizedFields = ['password', 'token', 'secret', 'key'];
        sanitizedFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        });
        return sanitized;
    }
}