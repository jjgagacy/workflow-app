import { EmailContent, MailClient } from "../interfaces/client.interface";
import { LoggerService } from "@nestjs/common";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from 'uuid';
import * as handlebars from 'handlebars';

interface MailSenderConfig {
  client: MailClient;
  defaultSendFrom: string;
  logger: LoggerService;
  maxRetries?: number;
  timeout?: number;
}

export class MailSender {
  private client: MailClient;
  private readonly defaultSendFrom: string;
  private readonly logger: LoggerService;
  private readonly maxRetries: number;

  constructor(config: MailSenderConfig) {
    this.client = config.client;
    this.defaultSendFrom = config.defaultSendFrom;
    this.logger = config.logger;
    this.maxRetries = config.maxRetries || 3;
  }

  setClient(client: MailClient): void {
    this.client = client;
  }

  async send(to: string, subject: string, content: EmailContent, from?: string) {
    if (!this.client) {
      throw new Error('Mail client is not initialized');
    }
    const fromAddress = from || this.defaultSendFrom;
    // 参数验证
    if (!fromAddress) throw new Error('Mail from address is not set');
    if (!to) throw new Error('Mail to address is not set');
    if (!subject) throw new Error('Mail subject is not set');
    if (!content) throw new Error('Mail html content is not set');

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
    this.logSendAttempt({ requestId, to, from: fromAddress, subject, htmlLength, templateName: templateInfo.templateName, context: templateInfo.context, timestamp: new Date().toISOString() });

    try {
      const result = await this.client.send({
        from: fromAddress,
        to,
        subject,
        html,
      });
      this.logSendSuccessfully({ requestId, to, from: fromAddress, subject, htmlLength, duration: Date.now() - startTime, messageId: result.messageId, response: result.response });
    } catch (error) {
      this.logSendError({ requestId, to, from: fromAddress, subject, htmlLength, duration: Date.now() - startTime, error: error.message, stack: error.stack });
    }
  }

  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    try {
      const templatePath = this.getTemplatePath(templateName);
      const source = readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(source);
      return compiledTemplate(context);
    } catch (error) {
      this.logger.log(`Failed to render template: ${templateName}: ${error.message}`, error.stack);
      throw new Error(`Template ${templateName} not found or invalid`);
    }
  }

  private getTemplatePath(templateName: string): string {
    // check dist directory
    const distPath = join(__dirname, '../../../dist/mail/templates/', templateName);
    console.log('dist', distPath);
    if (existsSync(distPath)) {
      return distPath;
    }

    // else check src directory
    const srcPath = join(__dirname, '../../../src/mail/templates', templateName);
    if (existsSync(srcPath)) {
      return srcPath;
    }

    const relativePath = join(process.cwd(), 'dist/mail/templates', templateName);
    if (existsSync(relativePath)) {
      return relativePath;
    }

    throw new Error(`Template file not found: ${templateName}`);
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