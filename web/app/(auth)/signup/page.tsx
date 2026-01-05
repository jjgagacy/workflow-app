'use client';

import { ErrorAlert } from "@/app/components/base/alert";
import Button from "@/app/components/base/button";
import usePageTitle from "@/hooks/use-page-title";
import { CheckCircle, User, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [showEmailCodeSended, setShowEmailCodeSended] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    verificationCode: '',
  });

  usePageTitle(t('login.signup_title'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 验证用户名
    if (!formData.username.trim()) {
      setErrors({ username: t('account.enter_username') });
      return;
    }
    if (formData.username.length < 2) {
      setErrors({ username: t('account.username_min_length') });
      return;
    }
    if (formData.username.length > 20) {
      setErrors({ username: t('account.username_max_length') });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // 模拟API调用，保存用户名
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowVerification(true);
    } catch (err) {
      setErrors({ username: t('account.registration_failed') });
    } finally {
      setIsLoading(false);
    }
  }

  const getErrorMessage = (errors: Record<string, string>): string => {
    if (Object.keys(errors).length === 0) return '';
    // 返回第一个错误信息
    return Object.values(errors)[0];
    // 或者连接所有错误信息
    // return Object.values(errors).join('。');
  };

  const handleGoogleLogin = () => {
    // 模拟 Google 登录
    window.location.href = '/api/auth/google';
  };

  const returnSetEmail = () => {
    setShowVerification(false);
    setErrors({});
    setShowEmailCodeSended(false);
    // setCountdown(0);
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setErrors({ email: t('account.enter_email_first') });
      return;
    }
    // 开始倒计时
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowEmailCodeSended(true);
    } catch (error) {
      setErrors({ submit: t('account.send_code_failed') });
    }
  };

  return (
    <>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            {getErrorMessage(errors) !== '' && (
              <ErrorAlert message={getErrorMessage(errors)} />
            )}
            {/* 欢迎消息 */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('account.welcome_to_monie')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('account.one_step_to_start')}
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white dark:bg-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Username Input */}
              <div>
                {showVerification ? (
                  <div className="space-y-6">
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-transparent transition-all`}
                          placeholder={t('account.email_placeholder')}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="verificationCode"
                            type="text"
                            value={formData.verificationCode}
                            onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                            className={`block w-full pl-10 pr-3 py-3 border ${errors.verificationCode ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                              } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-transparent transition-all`}
                            placeholder={t('account.enter_6_digit_code')}
                            maxLength={6}
                          />
                        </div>
                        {errors.verificationCode && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.verificationCode}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={countdown > 0}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${countdown > 0
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          }`}
                      >
                        {countdown > 0 ? `${countdown}s` : t('account.send_verification_code')}
                      </button>
                    </div>
                    {showEmailCodeSended && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('account.verification_code_sent_to')} {formData.email}
                      </p>
                    )}
                  </div>
                ) : (
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
                        setErrors({});
                      }}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-transparent transition-all`}
                      placeholder={t('account.username_placeholder')}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                )}

                {/* 用户名提示 */}
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

                {/* 错误提示 */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                variant={'primary'}
                size={'large'}
                onClick={handleSubmit}
                className="w-full flex items-center justify-center px-6 py-6 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? t('account.processing') : t('account.start_creation')}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {t('account.or_choose_other_way')}
                  </span>
                </div>
              </div>
            </div>

            {/* Alternative Options */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {t('account.login_with_google')}
              </span>
            </button>
          </div >

          {/* Already have account */}
          < div className="mt-8 text-center" >
            <p className="text-gray-600 dark:text-gray-400">
              {t('account.already_have_account')}
              <Link
                href="/login"
                className="ml-2 font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                {t('account.login_now')}
              </Link>
            </p>
          </div >

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('account.agreement_prefix')}
              <Link href="/terms" className="text-green-600 hover:text-green-500 ml-1 mr-1">
                {t('account.terms_of_service')}
              </Link>
              {t('account.agreement_and')}
              <Link href="/privacy" className="text-green-600 hover:text-green-500 ml-1">
                {t('account.privacy_policy')}
              </Link>
            </p>
          </div>

        </div >
      </main >
    </>
  );
}