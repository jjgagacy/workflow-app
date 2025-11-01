import { EnumConverter } from "@/common/utils/enums";
import { EmailContent, TemplateFile } from "../interfaces/client.interface";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import configuration from "@/config/configuration";
import { v4 as uuidv4 } from 'uuid';
import * as handlebars from 'handlebars';
import { join } from "path";
import { readFileSync } from "fs";
import { GlobalLogger } from "@/logger/logger.service";

export enum EmailLanguage {
    EN_US = 'en-US',
    ZH_HANS = 'zh-Hans',
}

export enum EmailType {
    INVITE_MEMBER = 'invite_member',
    RESET_PASSWORD = 'reset_password',
    EMAIL_CODE_LOGIN = 'email_code_login',
    CHANGE_EMAIL_OLD = 'change_email_old',
    ACCOUNT_DELETION_SUCCESS = 'account_deletion_success',
}

export function convertLanguageCode(lang: string): EmailLanguage {
    return EnumConverter.toEnum(EmailLanguage, lang);
}

export interface EmailI18nConfig {
    readonly templates: Map<EmailType, Map<EmailLanguage, EmailContent>>;
}

@Injectable()
export class MailI18nService {
    private config: EmailI18nConfig;
    private readonly applicationName: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: GlobalLogger,
    ) {
        this.applicationName = this.configService.get<string>('APPLICATION_NAME', configuration().defaultApplicationName);
        this.config = this.initializeConfig();
    }

    private initializeConfig(): EmailI18nConfig {
        const templates = new Map<EmailType, Map<EmailLanguage, EmailContent>>();
        this.initializeEmailTemplates(templates);

        return { templates: templates };
    }

    private initializeEmailTemplates(templates: Map<EmailType, Map<EmailLanguage, EmailContent>>): void {
        // 邀请成员邮件模板
        templates.set(EmailType.INVITE_MEMBER, new Map([
            [EmailLanguage.EN_US, {
                subject: 'Join {application_name} Workspace Now',
                templateName: 'invite_member.hbs',
                context: {},
            }],
            [EmailLanguage.ZH_HANS, {
                subject: '立即加入 {application_name} 工作空间',
                templateName: 'invite_member.hbs',
                context: {},
            }]
        ]));

        // 重置密码邮件模板
        templates.set(EmailType.RESET_PASSWORD, new Map([
            [EmailLanguage.EN_US, {
                subject: 'Reset Your {application_name} Password',
                templateName: 'reset_password.hbs',
                context: {},
            }],
            [EmailLanguage.ZH_HANS, {
                subject: '重置您的 {application_name} 密码',
                templateName: 'reset_password.hbs',
                context: {},
            }]
        ]));

        // 邮箱验证码登录模板
        templates.set(EmailType.EMAIL_CODE_LOGIN, new Map([
            [EmailLanguage.EN_US, {
                subject: 'Your {application_name} Login Verification Code',
                templateName: 'email_code_login.hbs',
                context: {},
            }],
            [EmailLanguage.ZH_HANS, {
                subject: '您的 {application_name} 登录验证码',
                templateName: 'email_code_login.hbs',
                context: {},
            }]
        ]));

        // 修改邮箱地址验证（旧邮箱）模板
        templates.set(EmailType.CHANGE_EMAIL_OLD, new Map([
            [EmailLanguage.EN_US, {
                subject: 'Verify Your {application_name} Email Change Request',
                templateName: 'change_email_old.hbs',
                context: {},
            }],
            [EmailLanguage.ZH_HANS, {
                subject: '验证您的 {application_name} 邮箱修改请求',
                templateName: 'change_email_old.hbs',
                context: {},
            }]
        ]));

        // 账户删除成功通知模板
        templates.set(EmailType.ACCOUNT_DELETION_SUCCESS, new Map([
            [EmailLanguage.EN_US, {
                subject: 'Your {application_name} Account Has Been Deleted',
                templateName: 'account_deletion_success.hbs',
                context: {},
            }],
            [EmailLanguage.ZH_HANS, {
                subject: '您的 {application_name} 账户已删除',
                templateName: 'account_deletion_success.hbs',
                context: {},
            }]
        ]));
    }

    async getEmailContent(emailType: EmailType, language: EmailLanguage, context: Record<string, any>): Promise<EmailContent> {
        const templateConfig = this.getTemplateConfig(emailType, language);
        const templateFile = templateConfig as TemplateFile;

        const mergedContext = {
            application_name: this.applicationName,
            ...templateFile.context,
            ...context,
        };
        // const htmlContent = await this.renderTemplate(templateFile.templateName, mergedContext);
        const processedSubject = this.processSubject(templateFile.subject, mergedContext);

        return {
            subject: processedSubject,
            templateName: `i18n/${language}/` + templateFile.templateName,
            context: mergedContext,
        };
    }

    private getTemplateConfig(emailType: EmailType, language: EmailLanguage): EmailContent {
        const typeTemplates = this.config.templates.get(emailType);

        let template = typeTemplates?.get(language);
        if (!template) {
            template = typeTemplates?.get(EmailLanguage.EN_US);
            if (!template) {
                throw new Error(`No template found for: ${emailType} in ${language} or english`);
            }
        }

        return template;
    }

    private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
        try {
            const templatePath = join(__dirname, '../../../../mail/templates/i18n/', `${templateName}.hbs`);
            const source = readFileSync(templatePath, 'utf-8');
            const compiledTemplate = handlebars.compile(source);
            return compiledTemplate(context);
        } catch (error) {
            this.logger.log(`Failed to render template: ${templateName}: ${error.message}`, error.stack);
            throw new Error(`Template ${templateName} not found or invalid`);
        }
    }

    private processSubject(subject?: string, context?: Record<string, any>): string {
        if (typeof subject === 'undefined' || typeof context === 'undefined') {
            return '';
        }
        return subject.replace(/{(\w+)}/g, (match, key) => {
            return context[key] !== undefined ? context[key] : match;
        });
    }

}