export type LanguageType = 'en-US' | 'zh-Hans';

export const LanguageEmojiDefault = '🌐';

export interface LanguageConfig {
  value: LanguageType;
  name: string;
  promptName: string;
  example: string;
  supported: boolean;
  emoji?: string;
}

export const languages: LanguageConfig[] = [
  {
    value: 'en-US',
    name: 'English',
    promptName: 'English',
    example: 'Hello!',
    supported: true,
    emoji: '🇺🇸'
  },
  {
    value: 'zh-Hans',
    name: '简体中文',
    promptName: 'Chinese Simplified',
    example: '你好！',
    supported: true,
    emoji: '🇨🇳'
  },
];

export const supportedLanguages = languages.filter(lang => lang.supported);

export const defaultLanguage = supportedLanguages[0];

export const getLanguageByValue = (value: string) => {
  return languages.find(lang => lang.value === value);
};
