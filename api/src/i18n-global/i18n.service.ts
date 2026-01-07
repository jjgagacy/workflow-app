import { I18nTranslations } from "@/generated/i18n.generated";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { I18nService } from "nestjs-i18n";
import { getMappedLang } from "./langmap";
import { ValidationError } from "class-validator";

enum I18nCategory {
  ACCOUNT = 'account',
  AUTH = 'auth',
  BILLING = 'billing',
  HELLO = 'hello',
  MODEL = 'model',
  SYSTEM = 'system',
  TENANT = 'tenant',
  VALIDATION = 'validation',
}

const I18N_CATEGORIES = Object.values(I18nCategory);
export type I18nCategoryType = keyof I18nTranslations;
const I18N_CATEGORIES_TYPED = Object.values(I18N_CATEGORIES) as I18nCategoryType[];

export interface I18nValidationError extends ValidationError {
  translatedMessages?: string[];
}

@Injectable()
export class I18nHelperService {
  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  async translateError(error: any, request: Request): Promise<string> {
    if (typeof error === 'string') {
      return this.translateMessage(error, {}, request);
    }

    if (error?.message) {
      return this.translateMessage(error?.message, {}, request);
    }

    return 'Unknown i18n error';
  }

  async translateMessage(message: string, options: Record<string, string>, request: Request): Promise<string> {
    const language = this.getLanguage(request);
    const mappedLang = getMappedLang(language);

    if (this.isI18nKey(message)) {
      try {
        return await this.i18n.t(message as any, {
          lang: mappedLang,
          args: options,
        });
      } catch (error) {
        console.warn(`Translation failed: ${message}`, error);
        return message;
      }
    }
    return message;
  }

  async translateValidationErrors(errors: any[], request: Request): Promise<I18nValidationError[]> {
    const translated = await Promise.all(
      errors.map(async (error) => {
        const constraints = error.constraints || {};
        const translatedConstraints: Record<string, string> = {};

        for (const [key, message] of Object.entries(constraints)) {
          translatedConstraints[key] = await this.translateMessage(
            message as string,
            error.property ? { property: error.property, ...error.contexts?.[key] } : error.contexts?.[key],
            request,
          );
        }

        return {
          ...error,
          constraints: translatedConstraints,
          translatedMessages: Object.values(translatedConstraints),
        };
      }));
    return translated;
  }

  private getLanguage(request: Request): string {
    // 从请求头获取
    const acceptLanguage = request.headers?.['accept-language'];
    if (acceptLanguage) {
      return acceptLanguage.split(',')[0].trim();
    }

    // 从查询参数获取
    const url = new URL(request.url, 'http://localhost');
    const lang = url.searchParams.get('lang');
    if (lang) {
      return lang;
    }

    return 'zh-Hans';
  }

  private isI18nKey(message: string): boolean {
    return I18N_CATEGORIES_TYPED.some(category =>
      message.startsWith(`${category}.`));
  }
}
