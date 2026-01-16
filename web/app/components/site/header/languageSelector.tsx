'use client';

import { setClientLocale } from "@/i18n";
import { getLanguageNameByValue } from "@/i18n/config";
import { LanguageEmojiDefault, languages } from "@/types/language";
import { Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  const toggleLanguage = async (lng: string) => {
    if (i18n.language === lng) return;
    await setClientLocale(lng, false);
    setShowLanguageSelect(false);
  };

  return (
    <div className="relative w-30 h-10">
      <button
        onClick={() => setShowLanguageSelect(!showLanguageSelect)}
        className="flex items-center gap-2 p-2 w-full h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={i18n.language === 'zh' ? t('app.common.switch_to_english') : t('app.common.switch_to_chinese')}
      >
        <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {getLanguageNameByValue(i18n.language)}
      </button>

      {showLanguageSelect && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowLanguageSelect(false)}
          />
          {/* 下拉菜单 */}
          <div className="absolute top-6 right-0 mt-4 w-32 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
            <ul className="py-1">
              {languages.map(lang => (
                <li key={lang.name} className="flex items-center">
                  <button
                    onClick={() => toggleLanguage(lang.value)}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span className="text-lg">{lang.emoji || LanguageEmojiDefault}</span>
                    <span>{lang.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
