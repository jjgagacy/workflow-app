import { Check, ChevronDown } from "lucide-react";
import { ContentSection } from "../content-section";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { languages, LanguageType } from "@/types/language";
import { ThemeType } from "@/types/theme";
import { AppearanceType } from "@/types/appearance";
import Button from "@/app/components/base/button";
import { TIME_ZONES } from "@/i18n/timezone";
import { useAppearance } from "@/hooks/use-appearance";

export default function SettingContent() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageType>((i18n.language || 'en-US') as LanguageType);
  const [theme, setTheme] = useState<ThemeType>('default');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const { selectAppearance, resolvedTheme, appearanceOptions } = useAppearance();
  const [appearance, setAppearance] = useState<AppearanceType>(resolvedTheme);

  // 使用 ref 来获取下拉菜单的 DOM 元素
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const timezoneDropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    { id: 'default', label: t('system.theme.default'), color: 'bg-gradient-to-r from-gray-500 to-gray-600' },
    { id: 'blue', label: t('system.theme.blue'), color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { id: 'green', label: t('system.theme.green'), color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { id: 'amber', label: t('system.theme.amber'), color: 'bg-gradient-to-r from-amber-500 to-amber-600' }
  ];

  const timezones = TIME_ZONES.map(timezone => ({
    id: timezone.id,
    label: t(`system.${timezone.labelKey}`),
  }))

  const handleLanguageChange = (lang: LanguageType) => {
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
  }

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    setIsThemeDropdownOpen(false);
  }

  const handleAppearanceChange = (mode: AppearanceType) => {
    selectAppearance(mode);
    setAppearance(mode);
  }

  useEffect(() => {
    setAppearance(resolvedTheme);
  }, [resolvedTheme, setAppearance]);

  const toggleDropdown = (type: 'language' | 'theme' | 'timezone') => {
    switch (type) {
      case 'language':
        setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
        setIsThemeDropdownOpen(false);
        setIsTimezoneDropdownOpen(false);
        break;
      case 'theme':
        setIsThemeDropdownOpen(!isThemeDropdownOpen);
        setIsLanguageDropdownOpen(false);
        setIsTimezoneDropdownOpen(false);
        break;
      case 'timezone':
        setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen);
        setIsLanguageDropdownOpen(false);
        setIsThemeDropdownOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLanguageDropdownOpen &&
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (isThemeDropdownOpen &&
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
      if (isTimezoneDropdownOpen &&
        timezoneDropdownRef.current &&
        !timezoneDropdownRef.current.contains(event.target as Node)) {
        setIsTimezoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLanguageDropdownOpen, isThemeDropdownOpen, isTimezoneDropdownOpen]);


  return (
    <ContentSection
      title={t('system.settings')}
      description=""
    >
      <header className="mb-8">
        <h1 className="text-md font-bold text-gray-500 dark:text-white">{t('system.general')}</h1>
      </header>

      <div className="space-y-8">
        {/* 语言设置 */}
        <div className="bg-background rounded-2xl">
          <div className="flex items-center mb-6">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">{t('system.language_settings')}</h2>
          </div>

          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => toggleDropdown('language')}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{languages.find(l => l.value === language)?.emoji}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {languages.find(l => l.value === language)?.name}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''
                }`} />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleLanguageChange(lang.value as LanguageType)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{lang.emoji}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{lang.name}</span>
                    </div>
                    {language === lang.value && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* 外观设置 */}
        <div className="bg-background rounded-2xl">
          <div className="flex items-center mb-6">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">{t('system.appearance_settings')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appearanceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleAppearanceChange(option.value as AppearanceType)}
                  className={`
                      flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all
                      ${appearance === option.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600'
                    }
                    `}
                >
                  <Icon className={`w-8 h-8 mb-3 ${appearance === option.value
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  <span className={`font-medium ${appearance === option.value
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-700 dark:text-gray-300'
                    }`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 主题设置 */}
        <div className="bg-background rounded-2xl">
          <div className="flex items-center mb-6">
            <div>
              <h2 className="text-md font-semibold text-gray-900 dark:text-white">{t('system.theme_settings')}</h2>
            </div>
          </div>

          <div className="relative mb-4" ref={themeDropdownRef}>
            <button
              onClick={() => toggleDropdown('theme')}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-3 ${themeOptions.find(t => t.id === theme)?.color}`} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {themeOptions.find(t => t.id === theme)?.label}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''
                }`} />
            </button>

            {isThemeDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id as ThemeType)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full mr-3 ${option.color}`} />
                      <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                    </div>
                    {theme === option.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 时区设置 */}
        <div className="bg-background">
          <div className="flex items-center mb-6">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">{t('system.timezone_settings')}</h2>
          </div>

          <div className="relative" ref={timezoneDropdownRef}>
            <button
              onClick={() => toggleDropdown('timezone')}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {timezones.find(tz => tz.id === timezone)?.label}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isTimezoneDropdownOpen ? 'rotate-180' : ''
                }`} />
            </button>

            {isTimezoneDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-lg">
                {timezones.map((tz) => (
                  <button
                    key={tz.id}
                    onClick={() => {
                      setTimezone(tz.id);
                      setIsTimezoneDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{tz.label}</span>
                    {timezone === tz.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => {
              // 保存设置的逻辑
              alert('设置已保存！');
            }}
            variant={'primary'}
            size={'large'}
            className="px-8 py-3"
          >
            {t('system.save_settings')}
          </Button>
        </div>

      </div>

    </ContentSection>
  );
};