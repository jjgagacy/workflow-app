export const i18nLangMap: Record<string, string> = {
  // 简体中文相关
  'zh-Hans': 'zh-Hans',
  'zh-hans': 'zh-Hans',
  'zh': 'zh-Hans', // 默认简体中文
  'zh-CN': 'zh-Hans',
  'zh-SG': 'zh-Hans',

  // 繁体中文相关
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
  'zh-Hant': 'zh-Hant',
  'zh-hant': 'zh-Hant',

  // 英语相关 - 主要变体
  'en': 'en-US',          // 默认美国英语
  'en-US': 'en-US',       // 美国英语
  'en-GB': 'en-GB',       // 英国英语
  'en-AU': 'en-AU',       // 澳大利亚英语
  'en-CA': 'en-CA',       // 加拿大英语
  'en-NZ': 'en-NZ',       // 新西兰英语
  'en-IE': 'en-IE',       // 爱尔兰英语
  'en-IN': 'en-IN',       // 印度英语
  'en-ZA': 'en-ZA',       // 南非英语

  // 英语相关 - 其他地区变体
  'en-SG': 'en-SG',       // 新加坡英语
  'en-MY': 'en-MY',       // 马来西亚英语
  'en-PH': 'en-PH',       // 菲律宾英语
  'en-HK': 'en-HK',       // 香港英语
  'en-JM': 'en-JM',       // 牙买加英语
  'en-BZ': 'en-BZ',       // 伯利兹英语
  'en-TT': 'en-TT',       // 特立尼达和多巴哥英语
  'en-ZW': 'en-ZW',       // 津巴布韦英语
  'en-KE': 'en-KE',       // 肯尼亚英语
  'en-NG': 'en-NG',       // 尼日利亚英语

  // 英语相关 - 其他常见代码
  'en-001': 'en-US',      // 世界英语（通常映射到美国英语）
  'en-150': 'en-US',      // 欧洲英语
  'en-Latn': 'en-US',     // 拉丁字母英语
  'en-Latn-US': 'en-US',  // 美国拉丁字母英语
};

export function getMappedLang(lang: string, defaultLang: string = 'en-US'): string {
  return i18nLangMap[lang] || defaultLang;
}
