import { useTranslation } from "react-i18next";
import { useAuth } from "../use-auth";
import { useRouter } from "next/navigation";
import { useAuthForm } from "./use-authForm";
import api from "@/api";
import { useCallback, useState } from "react";
import { getErrorMessage } from "@/utils/errors";

export function useForgotPasswordForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const base = useAuthForm({
    mode: 'forgot-password',
    initialData: {
      email: '',
      token: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
    }
  });

  const {
    showVerification,
    validateField,
    formData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    setShowVerification,
    handleSendVerificationCode,
    countdown,
    setCountdown,
    setFormData,
  } = base;
  const validateEmailMutation = api.account.useValidateEmail();
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState<'email' | 'verification' | 'newPassword'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const forgotPasswordCheckMutation = api.account.useForgotPasswordCheck();
  const forgotPassowrdResetMutation = api.account.useForgotPasswordReset();

  // 更新表单字段
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmailValidation = useCallback(async () => {
    const result = await validateEmailMutation({ email: formData.email });
    if (!result) {
      throw new Error(t('account.email_check_error'));
    }
    setShowVerification(true);
  }, [validateEmailMutation, formData.email, setShowVerification]);

  // 重置表单
  const resetForm = () => {
    setStep('email');
    setFormData({
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      token: '',
      username: '',
      mode: 'forgot-password',
    });
    setErrors({});
    setCountdown(0);
  };

  // 返回上一步
  const goBack = () => {
    if (step === 'verification') {
      setStep('email');
    } else if (step === 'newPassword') {
      setStep('verification');
    }
    setErrors({});
  };

  // 验证邮箱格式
  const validateEmail = (email: string): string => {
    if (!email.trim()) return t('account.enter_email_first');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t('account.invalid_email_format');
    return '';
  };

  // 验证密码
  const validatePassword = (password: string): string => {
    if (!password.trim()) return t('account.enter_new_password');
    if (password.length < 6) return t('account.password_min_length');
    if (password.length > 32) return t('account.password_max_length');
    return '';
  };

  // 验证验证码
  const validateVerificationCode = (code: string): string => {
    if (!code.trim()) return t('account.enter_verification_code');
    if (code.length !== 6) return t('account.verification_code_must_be_6_digits');
    return '';
  };

  // 验证确认密码
  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (password !== confirmPassword) return t('account.passwords_do_not_match');
    return '';
  };

  // 验证验证码
  const handleVerifyCode = useCallback(async () => {
    const codeError = validateVerificationCode(formData.verificationCode);
    if (codeError) {
      setErrors({ verificationCode: codeError });
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const result = await forgotPasswordCheckMutation({ input: { email: formData.email, code: formData.verificationCode, token: formData.token } });
      const isValid = result.isValid;
      if (isValid) {
        setFormData({ ...formData, token: result.token });
        setStep('newPassword');
      } else {
        setErrors({ verificationCode: t('account.invalid_verification_code') });
      }
    } catch (error: any) {
      setErrors({ submit: getErrorMessage(error) || t('account.verification_failed') });
    } finally {
      setIsLoading(false);
    }
  }, [validateVerificationCode, formData.verificationCode, setErrors, setIsLoading, setStep, forgotPasswordCheckMutation]);

  // 重置密码
  const handleResetPassword = useCallback(async () => {
    // 验证所有字段
    const passwordError = validatePassword(formData.password);
    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword || '');

    const newErrors: Record<string, string> = {};
    if (passwordError) newErrors.password = passwordError;
    if (confirmError) newErrors.confirmPassword = confirmError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const result = await forgotPassowrdResetMutation({
        input: {
          token: formData.token,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword || ''
        }
      });

      if (result) {
        return { success: true, message: t('account.password_reset_success') };
      } else {
        setErrors({ submit: t('account.password_reset_failed') });
        return { success: false, message: t('account.password_reset_failed') };
      }
    } catch (error: any) {
      setErrors({ submit: getErrorMessage(error) || t('account.password_reset_failed') });
      return { success: false, message: getErrorMessage(error) || t('account.password_reset_failed') };
    } finally {
      setIsLoading(false);
    }
  }, [validatePassword, validateConfirmPassword, setErrors, setIsLoading, forgotPassowrdResetMutation]);

  return {
    ...base,
    validateField,
    handleResetPassword,
    handleEmailValidation,
    handleVerifyCode,
    goBack,
    resetForm,
    success,
    setSuccess,
    successMessage,
    setSuccessMessage,
    step,
    setStep,
    updateField,
    validateEmail,
  };
}