'use client';

import api from "@/api";
import { Button } from "@/app/components/base/button";
import { toast } from "@/app/ui/toast";
import { useAuthForm } from "@/hooks/account/use-authForm";
import { getErrorMessage } from "@/utils/errors";
import { AlertCircle, CheckCircle, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { set } from "zod";

interface ActivateFormData {
  username: string;
  email: string;
  workspaceId: string;
}

export default function ActivateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ActivateFormData>({ username: '', email: '', workspaceId: '' });
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const useInviteTokenCheck = api.account.useInviteTokenCheck();
  const useInviteMemberActivation = api.account.useInviteMemberActivation();
  const router = useRouter();

  const base = useAuthForm({ mode: 'signup' });
  const {
    validateField,
    setFormData: setBaseFormData
  } = base;

  // 使用 useCallback 包装获取数据的函数
  const fetchTokenData = useCallback(async () => {
    if (!token) return;
    try {
      const checkData = await useInviteTokenCheck({ token });
      setFormData(prev => ({
        ...prev,
        username: checkData.inviteeName,
        email: checkData.inviteeEmail,
        workspaceId: checkData.workspaceId
      }));
      setWorkspaceName(checkData.workspaceName);
      setBaseFormData(prev => ({
        ...prev,
        email: checkData.inviteeEmail,
        username: checkData.inviteeName
      }));
    } catch (error) {
      console.error('Failed to check invite token:', error);
      toast.error(getErrorMessage(error));
    }
  }, [token]);

  // 在 useEffect 中调用
  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    const usernameError = validateField('username');
    if (usernameError) {
      newErrors.username = usernameError;
    }

    return newErrors;
  }, [validateField, formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const activationResult = await useInviteMemberActivation({
        input: {
          inviteeName: formData.username,
          inviteeEmail: formData.email,
          workspaceId: formData.workspaceId,
          token
        }
      });
      if (!activationResult) {
        toast.error(t('account.activation_failed'));
        return;
      }
      toast.success(t('account.activation_success'));
      router.push('login');
    } catch (error) {
      console.error('Failed to activate account:', error);
      setErrors({ submit: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [formData, token, setIsLoading, useInviteMemberActivation, validateForm]);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        {/* 欢迎消息 */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('account.welcome_to_monie')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {t('account.one_step_to_start')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setBaseFormData(prev => ({
                    ...prev,
                    username: e.target.value
                  }));
                  setErrors({});
                }}
                className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-transparent transition-all`}
                placeholder={t('account.username_placeholder')}
                autoComplete="off"
                autoFocus
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.username}
              </p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('account.username_tip1')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('account.username_tip2')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('account.username_tip3')}
              </p>
            </div>
          </div>

          {/* 错误提示 */}
          {errors.submit && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* 用户名可用性检查 */}
          {formData.username.length >= 2 && !errors && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in fade-in duration-300">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {t('account.username_available')}
              </p>
            </div>
          )}

          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            variant={'primary'}
            size={'large'}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center px-6 py-6 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? t('account.processing') : t('account.activate_account_button')}
          </Button>

        </form>
      </div>
    </div>
  );
};