'use client';

import { ErrorAlert } from "@/app/components/base/alert";
import Button from "@/app/components/base/button";
import { useAuth } from "@/hooks/use-auth";
import usePageTitle from "@/hooks/use-page-title";
import { IconLock, IconMail } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api";
import { getErrorMessage } from "@/utils/errors";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const loginMutation = api.user.useLogin();
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: '',
  });

  usePageTitle(t('login.login_title'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    // 如果邮箱账户不存在显示注册
    // 注册需要验证邮箱
    const emailCheckOk = true;
    const emailExisting = false;
    if (!emailCheckOk) {
      setErrors({ submit: t('account.email_check_error') });
      return;
    }
    if (emailExisting) {
      setUsePassword(true);
    } else {
      setIsLoading(true);
      await handleSendVerificationCode();
      setShowVerification(true);
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
    } catch (error) {
      setErrors({ submit: t('account.send_verification_code_failed') });
    }
  };

  return (
    <>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {getErrorMessage(errors) !== '' && (
              <ErrorAlert message={getErrorMessage(errors)} />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('account.welcome_back')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('account.login_to_your_monie_account')}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl  border-gray-200 dark:border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
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
                    placeholder={t('account.your_email_placeholder')}
                  />
                </div>
              </div>

              {usePassword && (
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                      placeholder={t('account.enter_password_placeholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {showVerification && (
                <div>
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
                            } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                          placeholder={t('account.enter_6_digit_code_placeholder')}
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
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {t('account.verification_code_sent_to')} {formData.email}
                  </p>
                </div>
              )}

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
                {t('account.login_button')}
              </Button>

              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {!showVerification && (
                <>
                  {/* Forgot Password */}
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                      {t('account.forgot_password')}
                    </Link>
                  </div>
                </>
              )}
            </form>

            {showVerification ? (
              <div className="flex items-center justify-center mt-5">
                <Link href="#" onClick={returnSetEmail} className="inline-flex items-center group text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {t('account.go_back')}
                </Link>
              </div>
            ) : (
              <div>
                {/* Divider */}
                <div className="mt-8 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        {t('account.or_login_with')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
                >
                  <FcGoogle className="w-5 h-5 mr-3" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {t('account.login_with_google')}
                  </span>
                </button>

                <div className="mt-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('account.no_account_yet')}
                    <Link
                      href="/signup"
                      className="ml-2 font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                      {t('account.signup_now')}
                    </Link>
                  </p>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('account.agreement_prefix')}
                    <Link href="/terms" className="text-green-600 hover:text-green-500 ml-1 mr-1">
                      {t('account.terms_of_service')}
                    </Link>
                    {t('account.login_agreement_and')}
                    <Link href="/privacy" className="text-green-600 hover:text-green-500 ml-1">
                      {t('account.privacy_policy')}
                    </Link>
                  </p>
                </div>
              </div>
            )}

          </div >

        </div >
      </main >
    </>
  );
}