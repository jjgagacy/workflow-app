'use client';

import Button from "@/app/components/base/button";
import { useRegistrationForm } from "@/hooks/account/use-registrationForm";
import usePageTitle from "@/hooks/use-page-title";
import { CheckCircle, User, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";

export default function SignUp() {
  const { t } = useTranslation();
  usePageTitle(t('account.signup_title'));

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    showVerification,
    setShowVerification,
    showEmailCodeSended,
    setShowEmailCodeSended,
    countdown,
    handleSendVerificationCode,
    handleSubmit,
  } = useRegistrationForm();

  const handleGoogleLogin = () => {
    // 模拟 Google 登录
    window.location.href = '/api/auth/google';
  };

  const returnSetUsername = () => {
    setShowVerification(false);
    setErrors({});
    setShowEmailCodeSended(false);
  };

  return (
    <>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
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
                    {errors.verificationCode && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.verificationCode}
                      </p>
                    )}
                    {showEmailCodeSended && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('account.verification_code_sent_to')} {formData.email}
                      </p>
                    )}
                  </div>
                ) : (
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
                  </div>
                )}

                {/* 用户名提示 */}
                {!showVerification && (
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
                )}

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
                {!showVerification && formData.username.length >= 2 && !errors && (
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

            {showVerification ? (
              <div className="flex items-center justify-center mt-5">
                <Link href="#" onClick={returnSetUsername} className="inline-flex items-center group text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {t('account.go_back')}
                </Link>
              </div>
            ) : (
              <>
                {/* Divider */}
                < div className="mt-8 mb-6">
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
              </>
            )}
          </div>

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
          </div>

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

        </div>
      </main >
    </>
  );
}