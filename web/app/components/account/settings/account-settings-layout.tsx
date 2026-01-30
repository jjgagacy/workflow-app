'use client';

import { CogIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProfileContent from "./content/profile-content";
import SettingContent from "./content/setting-content";
import { useCustomTheme } from "../../provider/customThemeProvider";
import { getThemeActiveClass, getThemeBgClass, ThemeType } from "@/types/theme";
import { parseAsStringLiteral, useQueryState } from "nuqs";

type MenuKey =
  | 'profile'
  | 'setting'
  | 'billing';

type MenuItem = {
  key: MenuKey;
  label: string;
  icon: React.ReactNode;
  description?: string;
};


export default function AccountSettingsLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { activeTheme: activeTheme } = useCustomTheme();


  const MENU_ITEMS: MenuItem[] = [
    {
      key: 'profile',
      label: t('system.accounts'),
      icon: <User className="w-5 h-5" />,
      description: ''
    },
    {
      key: 'setting',
      label: t('system.settings'),
      icon: <CogIcon className="w-5 h-5" />,
      description: ''
    }
  ] as const;

  const menuOptions = MENU_ITEMS.map(item => item.key);
  const [activeMenu, setActiveMenu] = useQueryState(
    'tab',
    parseAsStringLiteral(menuOptions).withDefault('profile')
  );

  useEffect(() => {
    const handleInvalidMenu = () => {
      if (!menuOptions.includes(activeMenu)) {
        setActiveMenu('profile');
      }
    };
    handleInvalidMenu();
  }, [activeMenu])

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return <ProfileContent />
      case 'setting':
        return <SettingContent />
    }
  }

  return (
    <>
      <div className="flex flex-1 rounded-lg px-4 sm:px-6 lg:px-8 py-12 bg-background">
        <div className="container mx-auto">
          <div className="pb-4 border-b border-[var(--border)]/30">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('system.settings')}
            </h1>
          </div>
          <div className="flex flex-1 min-h-[600]">
            <aside className="w-56 border-r py-8 border-[var(--border)]/30">
              <nav className="space-y-1 px-2">
                {MENU_ITEMS.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveMenu(item.key)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${activeMenu === item.key
                      ? `${getThemeBgClass(activeTheme as ThemeType)} ${getThemeActiveClass(activeTheme as ThemeType)}`
                      : ''
                      }`}
                  >
                    <div className={`mr-3 ${activeMenu === item.key ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${activeMenu === item.key ? 'text-gray-600 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{item.label}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </aside>

            <main className="flex-1 py-8">
              {renderContent()}
            </main>
          </div>

        </div>
      </div>
    </>
  );
}