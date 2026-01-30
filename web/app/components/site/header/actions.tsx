import { useTranslation } from "react-i18next";
import { X, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Button from "@/app/components/base/button";
import { useMobileMenu } from "@/context/mobile-menu-context";
import AppearanceToggle from "./appearanceToggle";
import { setClientLocale } from "@/i18n";
import { LanguageSelector } from "./languageSelector";

export default function Actions() {
  const { t, i18n } = useTranslation();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  const toggleLanguage = async (lng: string) => {
    if (i18n.language === lng) return;
    await setClientLocale(lng, false);
    setShowLanguageSelect(false);
  };

  return (
    <div className="flex items-center space-x-4">
      <LanguageSelector />

      {/* 桌面端登录/注册按钮 */}
      <div className="hidden sm:flex items-center space-x-3">
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
            href="/signup"
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
      {/* 主题切换 */}
      <AppearanceToggle />
    </div>
  )
}