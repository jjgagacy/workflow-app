const languageTimezoneMapping: Record<string, string> = {
  // 美洲
  "en-US": "America/New_York",      // 美国英语
  "en-CA": "America/Toronto",       // 加拿大英语
  "fr-CA": "America/Toronto",       // 加拿大法语
  "es-MX": "America/Mexico_City",   // 墨西哥西班牙语
  "pt-BR": "America/Sao_Paulo",     // 巴西葡萄牙语
  "es-AR": "America/Argentina/Buenos_Aires", // 阿根廷西班牙语
  "es-CO": "America/Bogota",        // 哥伦比亚西班牙语
  "es-PE": "America/Lima",          // 秘鲁西班牙语
  "es-CL": "America/Santiago",      // 智利西班牙语

  // 欧洲
  "en-GB": "Europe/London",         // 英国英语
  "fr-FR": "Europe/Paris",          // 法国法语
  "de-DE": "Europe/Berlin",         // 德国德语
  "es-ES": "Europe/Madrid",         // 西班牙西班牙语
  "it-IT": "Europe/Rome",           // 意大利意大利语
  "nl-NL": "Europe/Amsterdam",      // 荷兰荷兰语
  "pt-PT": "Europe/Lisbon",         // 葡萄牙葡萄牙语
  "ru-RU": "Europe/Moscow",         // 俄罗斯俄语
  "pl-PL": "Europe/Warsaw",         // 波兰波兰语
  "sv-SE": "Europe/Stockholm",      // 瑞典瑞典语
  "no-NO": "Europe/Oslo",           // 挪威挪威语
  "fi-FI": "Europe/Helsinki",       // 芬兰芬兰语
  "da-DK": "Europe/Copenhagen",     // 丹麦丹麦语
  "cs-CZ": "Europe/Prague",         // 捷克捷克语
  "hu-HU": "Europe/Budapest",       // 匈牙利匈牙利语
  "ro-RO": "Europe/Bucharest",      // 罗马尼亚罗马尼亚语
  "el-GR": "Europe/Athens",         // 希腊希腊语
  "bg-BG": "Europe/Sofia",          // 保加利亚保加利亚语

  // 亚洲
  "zh-Hans": "Asia/Shanghai",       // 简体中文
  "zh-Hant": "Asia/Taipei",         // 繁体中文
  "zh-HK": "Asia/Hong_Kong",        // 香港中文
  "zh-MO": "Asia/Macau",            // 澳门中文
  "zh-SG": "Asia/Singapore",        // 新加坡中文
  "ja-JP": "Asia/Tokyo",            // 日语
  "ko-KR": "Asia/Seoul",            // 韩语
  "hi-IN": "Asia/Kolkata",          // 印地语（印度）
  "ta-IN": "Asia/Kolkata",          // 泰米尔语
  "te-IN": "Asia/Kolkata",          // 泰卢固语
  "bn-IN": "Asia/Kolkata",          // 孟加拉语
  "ur-PK": "Asia/Karachi",          // 乌尔都语（巴基斯坦）
  "fa-IR": "Asia/Tehran",           // 波斯语
  "th-TH": "Asia/Bangkok",          // 泰语
  "vi-VN": "Asia/Ho_Chi_Minh",      // 越南语
  "id-ID": "Asia/Jakarta",          // 印尼语
  "ms-MY": "Asia/Kuala_Lumpur",     // 马来语
  "fil-PH": "Asia/Manila",          // 菲律宾语
  "my-MM": "Asia/Yangon",           // 缅甸语
  "km-KH": "Asia/Phnom_Penh",       // 高棉语
  "lo-LA": "Asia/Vientiane",        // 老挝语

  // 中东
  "ar-SA": "Asia/Riyadh",           // 阿拉伯语（沙特）
  "ar-AE": "Asia/Dubai",            // 阿拉伯语（阿联酋）
  "ar-EG": "Africa/Cairo",          // 阿拉伯语（埃及）
  "he-IL": "Asia/Jerusalem",        // 希伯来语
  "tr-TR": "Europe/Istanbul",       // 土耳其语

  // 非洲
  "sw-KE": "Africa/Nairobi",        // 斯瓦希里语
  "am-ET": "Africa/Addis_Ababa",    // 阿姆哈拉语
  "yo-NG": "Africa/Lagos",          // 约鲁巴语

  // 大洋洲
  "en-AU": "Australia/Sydney",      // 澳大利亚英语
  "en-NZ": "Pacific/Auckland",      // 新西兰英语
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
