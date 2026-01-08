import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";

export class TimeConverter {
  static secondsToMinutes(seconds: number, decimalPlaces: number = 1): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((seconds / 60) * factor) / factor;
  }

  static secondsToHours(seconds: number, decimalPlaces: number = 1): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((seconds / 3600) * factor) / factor;
  }

  static getHumanReadableTime(seconds: number, i18n: I18nService<I18nTranslations>): string {
    if (seconds < 60) {
      return i18n.t('common.TIME.SECONDS', { args: { count: seconds } });
    } else if (seconds < 3600) {
      const minutes = this.secondsToHours(seconds);
      return i18n.t('common.TIME.MINUTES', { args: { count: minutes } });
    } else if (seconds < 86400) {
      const hours = this.secondsToHours(seconds);
      return i18n.t('common.TIME.HOURS', { args: { count: hours } });
    } else {
      const days = seconds / 86400;
      const roundedDays = Math.round(days * 10) / 10;
      return i18n.t('common.TIME.DAYS', { args: { count: roundedDays } });
    }
  }
}
