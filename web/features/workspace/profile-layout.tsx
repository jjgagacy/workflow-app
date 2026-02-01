'use client';

import Button from "@/app/components/base/button";
import { Input } from "@/app/ui/input";
import { useAppContext } from "@/context/app-context";
import { ChevronRight, Edit, Edit2, Edit2Icon, Key, Mail, Shield, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import AvatarEdit from "./account/avatar-edit";
import api from "@/api";
import { toast } from "@/app/ui/toast";
import { Dialog } from "@/app/ui/dialog";
import ChangeEmailDialog from "./account/change-email-dialog";
import AccountDeleteDialog from "./account/account-delete";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { accountInfo, mutateAccountInfo } = useAppContext();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: '', // 默认头像
    id: '',
    created_at: ''
  });

  const [tempUsername, setTempUsername] = useState(userData.username);
  const [tempEmail, setTempEmail] = useState(userData.email);
  const useUpdateAccountName = api.account.useUpdateAccountName();

  useEffect(() => {
    if (accountInfo) {
      setUserData({
        id: accountInfo.id,
        username: accountInfo.username,
        email: accountInfo.email,
        avatar: accountInfo.avatar,
        created_at: accountInfo.created_at || ''
      });
      setTempUsername(accountInfo.username);
      setTempEmail(accountInfo.email);
    }
  }, [accountInfo]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  };

  // 保存用户名
  const handleSaveUsername = async () => {
    useUpdateAccountName({ input: { username: tempUsername } }).then(() => {
      mutateAccountInfo?.();
      setIsEditingUsername(false);
    }).catch((error) => {
      toast.error(error.message);
    });
  };

  // 保存邮箱
  const handleSaveEmail = () => {
  };

  // 删除账户
  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    logout();
    router.push('/login');
  };

  return (
    <>
      <div className="flex-1 mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 pb-4 border-b border-[var(--border)]">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('account.my_account')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('account.manage_your_account_settings')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：个人信息卡片 */}
          <div className="col-span-full space-y-6">
            {/* 个人信息卡片 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start space-x-4">
                {/* 头像区域 */}
                <AvatarEdit name={userData.username} avatar={userData.avatar} onSave={() => mutateAccountInfo?.()} />
                {/* 用户名和邮箱 */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userData.username || '未设置用户名'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {userData.email}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>{t('account.account_id') || '账户ID'}: {userData.id}</p>
                    <p className="mt-1">{t('account.member_since') || '加入时间'}: {userData.created_at}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 用户名设置 */}
            <div className="bg-background rounded-xl py-2">
              <div className="justify-between mb-4">
                <h3 className="text-lg mb-2 font-medium text-gray-900 dark:text-white">
                  {t('account.username')}
                </h3>
                <div className="flex">
                  <div className="flex-1 mr-2">
                    <Input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder={t('account.enter_username_placeholder')}
                      disabled={!isEditingUsername}
                    />
                  </div>

                  {!isEditingUsername ? (
                    <Button
                      onClick={() => {
                        setTempUsername(userData.username);
                        setIsEditingUsername(true);
                      }}
                      variant={'ghost'}
                      size={'medium'}
                      className="inline-flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('system.edit')}
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleSaveUsername}
                        variant={'primary'}
                        size={'medium'}
                      >
                        {t('system.save')}
                      </Button>
                      <Button
                        onClick={() => { setIsEditingUsername(false); setTempUsername(userData.username); }}
                        variant={'ghost'}
                        size={'medium'}
                      >
                        {t('system.cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 邮箱设置 */}
            <div className="bg-background rounded-xl py-2">
              <div className="justify-between mb-4">
                <h3 className="text-lg mb-2 font-medium text-gray-900 dark:text-white">
                  {t('system.email')}
                </h3>

                <div className="flex">
                  <div className="flex-1 mr-2">
                    <Input
                      type="text"
                      value={tempEmail}
                      onChange={(e) => setTempUsername(e.target.value)}
                      placeholder={t('account.enter_username_placeholder')}
                      disabled={true}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setTempEmail(userData.email);
                      setIsEditingEmail(true);
                    }}
                    variant={'ghost'}
                    size={'medium'}
                    className="inline-flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('app.actions.change')}
                  </Button>
                </div>
              </div>
            </div>

            {/* 删除账户 - 危险区域 */}
            <div className="bg-white mt-[40px] dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-400 p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-red-700 dark:text-red-300">
                    {t('account.delete_account')}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      {t('account.delete_account_warning')}
                    </p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>{t('account.delete_warning_data')}</li>
                      <li>{t('account.delete_warning_history')}</li>
                      <li>{t('account.delete_warning_subscription')}</li>
                      <li>{t('account.delete_warning_access')}</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="mt-4 px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {t('account.delete_account')}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ChangeEmailDialog
        isOpen={isEditingEmail}
        onClose={() => setIsEditingEmail(false)}
        onSuccess={() => { }}
        currentEmail={userData.email}
      />

      <AccountDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onSuccess={() => handleDeleteAccount}
        userEmail={userData.email}
      />
    </>
  )
}