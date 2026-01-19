'use client';

import { useAuth } from "@/hooks/use-auth";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/app-context";

export default function Avatar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { accountInfo } = useAppContext();

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: '', // 默认头像
  });
  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  // set userData from accountInfo
  useEffect(() => {
    if (accountInfo) {
      setUserData({
        username: accountInfo.username,
        email: accountInfo.email,
        avatar: accountInfo.avatar,
      });
    }
  }, [accountInfo]);

  return (
    <>
      <div className='flex items-center gap-2 rounded-md'>
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center p-2 space-x-2 max-w-xs rounded-full focus:outline-none">
            {userData?.avatar ? (
              <img
                src={userData.avatar}
                alt={t('system.user_avatar')}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                {userData?.username?.charAt(0)}
              </div>
            )}
            <ChevronDownIcon
              className="h-5 w-5 text-gray-500"
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
            <MenuItems className="origin-top-right absolute right-0 mt-2 w-68 rounded-md shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ring-opacity-5 py-1 focus:outline-none z-100">
              <MenuItem>
                <div className="flex flex-col px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-md font-medium text-gray-900 dark:text-white truncate">
                      {userData.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {userData.email}
                    </p>
                  </div>
                </div>
              </MenuItem>
              <MenuItem>
                {() => (
                  <button
                    onClick={handleLogout}
                    className={`flex items-center px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white`}
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
    </>
  );
}
