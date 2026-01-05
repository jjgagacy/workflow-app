'use client';

import { useMobileMenu } from "@/context/mobileMenuContext";
import { setClientLocale } from "@/i18n";
import { BookOpen, Brain, CreditCard, Globe, Moon, Smartphone, Sun, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import { useActiveTheme } from "../../active-theme";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const { activeTheme, setActiveTheme } = useActiveTheme();
  const { setTheme } = useTheme();

  const toggleLanguage = async () => {
    const lng = i18n.language === 'en-US' ? 'zh-Hans' : 'en-US';
    await setClientLocale(lng, false);
    setShowLanguageSelect(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Footer 链接数据
  const footerLinks = {
    product: [
      { label: t('home.footer.product.agent_platform'), href: "#" },
      { label: t('home.footer.product.workflow_engine'), href: "#" },
      { label: t('home.footer.product.api'), href: "#" },
      { label: t('home.footer.product.app_store'), href: "#" }
    ],
    resources: [
      { label: t('home.footer.resources.docs'), href: "#" },
      { label: t('home.footer.resources.blog'), href: "#" },
      { label: t('home.footer.resources.tutorials'), href: "#" },
      { label: t('home.footer.resources.api_reference'), href: "#" }
    ],
    company: [
      { label: t('home.footer.company.about'), href: "#" },
      { label: t('home.footer.company.careers'), href: "#" },
      { label: t('home.footer.company.contact'), href: "#" },
      { label: t('home.footer.company.media'), href: "#" }
    ],
    legal: [
      { label: t('home.footer.legal.terms'), href: "#" },
      { label: t('home.footer.legal.privacy'), href: "#" },
      { label: t('home.footer.legal.agreement'), href: "#" },
      { label: t('home.footer.legal.cookie'), href: "#" }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl font-bold text-white">Monie</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('home.footer.description')}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={toggleLanguage}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={i18n.language === 'zh-Hans' ? t('app.common.switch_to_english') : t('app.common.switch_to_chinese')}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={activeTheme === 'light' ? t('app.common.switch_to_dark') : t('app.common.switch_to_light')}
              >
                {activeTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {t('home.footer.sections.product')}
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {t('home.footer.sections.resources')}
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {t('home.footer.sections.company')}
            </h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">
              {t('home.footer.sections.legal')}
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">
                {t('home.footer.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#" className="hover:text-white transition-colors flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                {t('home.footer.bottom.download_app')}
              </Link>
              <Link href="#" className="hover:text-white transition-colors flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                {t('home.footer.bottom.documentation')}
              </Link>
              <Link href="#" className="hover:text-white transition-colors flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {t('home.footer.bottom.community')}
              </Link>
              <Link href="#" className="hover:text-white transition-colors flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                {t('home.footer.bottom.pricing')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}