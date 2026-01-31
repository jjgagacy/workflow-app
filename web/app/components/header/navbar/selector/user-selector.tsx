import { useCustomTheme } from '@/app/components/provider/customThemeProvider';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/hooks/use-auth';
import { getThemeBgClass, getThemeHoverClass, ThemeType } from '@/types/theme';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { ChevronDownIcon, CogIcon, LogOutIcon, UserCogIcon, UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

export function UserSelector() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();
  const { accountInfo } = useAppContext();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <div className='flex items-center gap-2 rounded-md mx-2'>
      <Menu as="div" className="relative">
        <MenuButton className="flex items-center p-2 space-x-2 max-w-xs rounded-full focus:outline-none">
          {accountInfo?.avatar ? (
            <img
              src={accountInfo.avatar}
              alt={t('system.user_avatar')}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {accountInfo?.username?.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-white">
            {accountInfo?.username || t('system.not_logged_in')}
          </span>
          <ChevronDownIcon
            className="h-4 w-4 text-gray-500"
            aria-hidden="true"
          />
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
          <MenuItems className={`bg-background origin-top-right absolute right-0 mt-2 px-2 w-48 rounded-md shadow-2xl border border-[var(--border)] ring-opacity-5 py-2 focus:outline-none z-100`}>
            <MenuItem>
              {() => (
                <button
                  onClick={() => router.push('/account')}
                  className={`flex font-medium items-center px-4 py-2 text-sm text-gray-700 rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)} dark:text-white`}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t('system.account_settings')}
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {() => (
                <button
                  onClick={() => router.push('/settings?tab=setting')}
                  className={`flex font-medium items-center px-4 py-2 text-sm text-gray-700 rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)} dark:text-white`}
                >
                  <CogIcon className="mr-2 h-4 w-4" />
                  {t('system.system_settings')}
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {() => (
                <button
                  onClick={handleLogout}
                  className={`flex font-medium items-center px-4 py-2 text-sm text-red-600 rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)} dark:text-white`}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  {t('system.logout')}
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}