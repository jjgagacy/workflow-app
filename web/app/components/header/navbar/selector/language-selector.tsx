import { getLanguageNameByValue } from '@/i18n/config';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Fragment } from "react";
import { LanguageEmojiDefault, languages } from '@/types/language';
import { setClientLocale } from '@/i18n';
import { useCustomTheme } from '@/app/components/provider/customThemeProvider';
import { getThemeHoverClass, ThemeType } from '@/types/theme';

export function LanguageSelector({ reloadPage = false }: { reloadPage?: boolean }) {
  const { t, i18n } = useTranslation();
  const { activeColorTheme, setActiveTheme: setActiveTheme } = useCustomTheme();

  const toggleLanguage = async (lng: string) => {
    if (i18n.language === lng) return;
    await setClientLocale(lng, false);
    if (reloadPage) location.reload();
  };

  return (
    <div className='flex items-center gap-2 hover:bg-secondary/80 rounded-lg mx-2'>
      <Menu as="div" className="relative">
        <MenuButton className={`flex items-center space-x-2 p-2 max-w-xs rounded-md focus:outline-none ${getThemeHoverClass(activeColorTheme as ThemeType)}`}>
          <Globe className="w-5 h-5 text-gray-400 hover:text-gray-500 mr-1" />
          {getLanguageNameByValue(i18n.language)}
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="origin-top-right absolute px-2 py-1 right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none z-100">
            {languages.map(lang => (
              <MenuItem key={lang.value}>
                <div className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm text-gray-700 w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}  dark:text-white`}>
                  <button
                    onClick={() => toggleLanguage(lang.value)}
                    className='w-full text-left flex flex-1 items-center'
                  >
                    <span className="text-lg mr-2">{lang.emoji || LanguageEmojiDefault}</span>
                    <h3 className='font-medium'>{lang.name}</h3>
                  </button>
                </div>
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}