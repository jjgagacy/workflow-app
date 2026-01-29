import { Check, ChevronDown, Globe, Monitor, Moon, Sun } from "lucide-react";
import { ContentSection } from "../content-section";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { languages, LanguageType } from "@/types/language";
import { ThemeType } from "@/types/theme";
import { AppearanceType } from "@/types/appearance";
import { getAppearanceOptions } from "@/app/components/site/header/appearanceToggle";
import { useActiveAppearance } from "@/app/components/appearance";
import Button from "@/app/components/base/button";

export default function SettingContent() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageType>((i18n.language || 'en-US') as LanguageType);
  const { activeAppearance: activeTheme, setActiveAppearance: setActiveTheme } = useActiveAppearance();
  const [appearance, setAppearance] = useState<AppearanceType>(activeTheme as AppearanceType);
  const [theme, setTheme] = useState<ThemeType>('default');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);

  const themeOptions = [
    { id: 'default', label: '默认主题', color: 'bg-gradient-to-r from-gray-100 to-gray-200' },
    { id: 'blue', label: '蓝色主题', color: 'bg-gradient-to-r from-blue-100 to-blue-200' },
    { id: 'green', label: '绿色主题', color: 'bg-gradient-to-r from-green-100 to-green-200' },
    { id: 'amber', label: '琥珀主题', color: 'bg-gradient-to-r from-amber-100 to-amber-200' }
  ];

  const timezones = [
    { id: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
    { id: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
    { id: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)' },
    { id: 'America/New_York', label: '美国东部时间 (UTC-5)' },
    { id: 'America/Los_Angeles', label: '美国太平洋时间 (UTC-8)' },
    { id: 'Europe/London', label: '格林威治标准时间 (UTC+0)' },
    { id: 'Europe/Paris', label: '中欧时间 (UTC+1)' },
    { id: 'Australia/Sydney', label: '澳大利亚东部时间 (UTC+10)' }
  ];

  const handleLanguageChange = (lang: any) => {
  }

  const handleThemeChange = (newTheme: any) => {
  }

  const handleAppearanceChange = (mode: any) => {
  }

  const handleReset = () => {
  }

  const appearanceOptions = useCallback(() => {
    return getAppearanceOptions(appearance, t);
  }, [appearance, t]);


  return (
    <ContentSection
      title="设置"
      description=""
    >
      <header className="mb-8">
        <h1 className="text-md font-bold text-gray-500 dark:text-white">通用</h1>
      </header>

      <div className="space-y-8">
        {/* 语言设置 */}
        <div className="bg-background rounded-2xl">
          <div className="flex items-center mb-6">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">语言设置</h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
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
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">外观设置</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appearanceOptions().map((option) => {
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
                  {appearance === option.value && (
                    <div className="mt-3 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                      已选择
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 时区设置 */}
        <div className="bg-background">
          <div className="flex items-center mb-6">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white">时区设置</h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen)}
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
            保存设置
          </Button>
        </div>

      </div>

    </ContentSection>
  );
};