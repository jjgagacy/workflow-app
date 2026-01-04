import { changeLanguage } from "@/i18n/config";
import { useTranslation } from "react-i18next";
import { Globe, X, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Button from "@/app/components/base/button";
import { useMobileMenu } from "@/context/mobileMenuContext";

export default function Actions() {
  const { t, i18n } = useTranslation();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  const toggleLanguage = async (lng: string) => {
    if (i18n.language === lng) return;
    await changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Language Selector */}
      <div className="relative w-10 h-10">
        <button
          onClick={() => setShowLanguageSelect(!showLanguageSelect)}
          className="p-2 w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={i18n.language === 'zh' ? t('common.switch_to_english') : t('common.switch_to_chinese')}
        >
          <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {showLanguageSelect && (
          <>
            {/* 点击外部关闭 */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowLanguageSelect(false)}
            />

            {/* 下拉菜单 */}
            <div className="absolute top-6 right-0 mt-2 w-32 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => toggleLanguage('en-US')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>English</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toggleLanguage('zh-Hans')}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>中文</span>
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>


      {/* 桌面端登录/注册按钮 */}
      <div className=" md:flex items-center space-x-3">
        <Button variant={'secondary'}>
          <Link
            href="/login"
            className="transition-colors font-medium"
          >
            {t('home.auth.login')}
          </Link>
        </Button>

        <Button variant={'primary'}>
          <Link
            href="/register"
            className="transition-opacity font-medium"
          >
            {t('home.auth.register')}
          </Link>
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

    </div>
  )
}