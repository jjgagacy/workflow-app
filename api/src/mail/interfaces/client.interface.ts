export interface MailClient {
    send(dto: SendEmailDto): Promise<any>
}

export interface SendEmailDto {
    from: string;
    to: string;
    subject: string;
    html: string;

    cc?: string;
    bcc?: string;
    text?: string;
    attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string; }>
    replyTo?: string;
    tags?: string[];
}

export interface TemplateFile {
    templateName: string;
    context: Record<string, any>;
}

export type EmailContent = string | TemplateFile;

