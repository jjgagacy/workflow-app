'use client';

import Button from "@/app/components/base/button";
import { useForgotPasswordForm } from "@/hooks/account/use-forgotPasswordForm";
import { getErrorMessage } from "@/utils/errors";
import { AlertCircle, CheckCircle, Eye, EyeOff, Key, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleResetPassword,
    handleVerifyCode,
    goBack,
    resetForm,
    handleSendVerificationCode,
    success,
    setSuccess,
    successMessage,
    setSuccessMessage,
    step,
    setStep,
    formData,
    setFormData,
    updateField,
    countdown,
    setCountdown,
    isLoading,
    setIsLoading,
    handleEmailValidation,
    errors,
    setErrors,
  } = useForgotPasswordForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      switch (step) {
        case 'email':
          await handleEmailValidation();
          await handleSendVerificationCode();
          setStep('verification');
          break;
        case 'verification':
          await handleVerifyCode();
          break;
        case 'newPassword':
          const result = await handleResetPassword();
          if (result?.success) {
            setSuccess(true);
            setSuccessMessage(result.message);
            // 1秒后跳转到登录页
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          break;
      }
    } catch (error: any) {
      setErrors({ submit: getErrorMessage(error) });
    }
  }

  // 获取当前步骤的提交按钮文本
  const getSubmitButtonText = () => {
    switch (step) {
      case 'email':
        return t('account.send_verification_code_button');
      case 'verification':
        return t('account.verify_code_button');
      case 'newPassword':
        return t('account.reset_password_button');
      default:
        return t('account.reset_password_button');
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('account.forgot_password_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('account.reset_password_description')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'email' ? 'bg-green-600 text-white' : step === 'verification' || step === 'newPassword' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step === 'verification' || step === 'newPassword' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'verification' ? 'bg-green-600 text-white' : step === 'newPassword' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${step === 'newPassword' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'newPassword' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
              3
            </div>
          </div>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                    placeholder={t('account.your_email_placeholder')}
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {t('account.enter_email_to_reset_password')}
                </p>
              </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 'verification' && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {t('account.verification_code_sent_to_email').replace('{email}', formData.email)}
                  </p>
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
                        onChange={(e) => updateField('verificationCode', e.target.value)}
                        className={`block w-full pl-10 pr-3 py-3 border ${errors.verificationCode ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                        placeholder={t('account.enter_verification_code')}
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={countdown > 0 || isLoading}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${countdown > 0 || isLoading
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
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 'newPassword' && (
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                      placeholder={t('account.enter_new_password')}
                      autoFocus
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
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword || ''}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                      placeholder={t('account.confirm_new_password')}
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
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('account.password_requirements') || 'Password must be at least 6 characters long'}
                  </p>
                </div>
              </div>
            )}


            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              variant={'primary'}
              size={'large'}
              className="w-full flex items-center justify-center px-6 py-3 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {getSubmitButtonText()}
            </Button>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {errors.submit}
                </p>
              </div>
            )}

          </form>
        </div>


      </div>
    </main>
  );
}