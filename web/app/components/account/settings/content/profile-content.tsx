'use client';

import AvatarEdit from "@/features/workspace/account/avatar-edit";
import { ContentSection } from "../content-section";
import { useAppContext } from "@/context/app-context";
import { useEffect, useState } from "react";
import { EditIcon, EyeIcon, LogOutIcon, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function ProfileContent() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { accountInfo, mutateAccountInfo } = useAppContext();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: '', // 默认头像
    id: '',
    created_at: ''
  });

  useEffect(() => {
    if (accountInfo) {
      setUserData({
        id: accountInfo.id,
        username: accountInfo.username,
        email: accountInfo.email,
        avatar: accountInfo.avatar,
        created_at: accountInfo.created_at || ''
      });
    }
  }, [accountInfo]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const handleViewProfile = () => {
    router.push('/account');
  }

  return (
    <ContentSection
      title={t('system.accounts')}
      description=""
    >
      <div className="flex justify-between bg-background">
        <div className="flex items-start space-x-4">
          {/* 头像区域 */}
          <AvatarEdit name={userData.username} avatar={userData.avatar} onSave={() => mutateAccountInfo?.()} />
          {/* 用户名和邮箱 */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {userData.username || t('system.no_name')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {userData.email}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{t('account.account_id')}: {userData.id}</p>
              <p className="mt-1">{t('account.member_since')}: {userData.created_at}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-4">
          <div className="flex gap-2">
            <div className="relative group">
              <button
                onClick={handleViewProfile}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={t('system.edit_account')}
              >
                <EditIcon className="h-5 w-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-neutral-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {t('system.edit_account')}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-neutral-800 transform rotate-45"></div>
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <LogOutIcon className="h-5 w-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-neutral-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {t('system.logout')}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-neutral-800 transform rotate-45"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </ContentSection>
  );
};