const languageTimezoneMapping: Record<string, string> = {
  "en-US": "America/New_York",
  "zh-Hans": "Asia/Shanghai",
  "zh-Hant": "Asia/Taipei",
  "pt-BR": "America/Sao_Paulo",
  "es-ES": "Europe/Madrid",
  "fr-FR": "Europe/Paris",
  "de-DE": "Europe/Berlin",
  "ja-JP": "Asia/Tokyo",
  "ko-KR": "Asia/Seoul",
  "ru-RU": "Europe/Moscow",
  "it-IT": "Europe/Rome",
  "uk-UA": "Europe/Kyiv",
  "vi-VN": "Asia/Ho_Chi_Minh",
  "ro-RO": "Europe/Bucharest",
  "pl-PL": "Europe/Warsaw",
  "hi-IN": "Asia/Kolkata",
  "tr-TR": "Europe/Istanbul",
  "fa-IR": "Asia/Tehran",
  "sl-SI": "Europe/Ljubljana",
  "th-TH": "Asia/Bangkok",
} as const;

const languages = Object.keys(languageTimezoneMapping) as Array<keyof typeof languageTimezoneMapping>;

export type SupportedLanguage = keyof typeof languageTimezoneMapping;

export type SupportedTimezone = typeof languageTimezoneMapping[SupportedLanguage];

export function supportedLanguage(lang: string): SupportedLanguage {
  if (languages.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }

  throw new Error(`${lang} is not a valid language`);
}

export function safeSupportedLanguage(lang: string): SupportedLanguage | null {
  return languages.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : null;
}

export function getTimezoneByLanguage(lang: SupportedLanguage): SupportedTimezone {
  return languageTimezoneMapping[lang];
}

export function getSupportedLanguages(): SupportedLanguage[] {
  return [...languages];
}

export function getSupportedTimezones(): SupportedTimezone[] {
  return Object.values(languageTimezoneMapping);
}

export function getSafeTimezone(lang: string): string {
  if (!lang) {
    return 'UTC';
  }
  try {
    const timezone = getTimezoneByLanguage(lang as SupportedLanguage);
    return timezone || 'UTC';
  } catch {
    return 'UTC';
  }
}
