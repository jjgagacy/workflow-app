import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { getClientLocale } from "@/i18n";
import api from "@/api";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "../use-auth";

export type AuthMode = 'signup' | 'login' | 'forgot-password';

interface UseAuthFormProps {
  mode?: AuthMode;
  initialData?: Partial<AuthFormData>;
}

export interface AuthFormData {
  mode: AuthMode;
  username: string;
  email: string;
  token: string;
  verificationCode: string;
  password: string;
  confirmPassword?: string;
}

export function useAuthForm({
  mode = 'signup',
  initialData = {}
}: UseAuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>(() => ({
    mode,
    username: initialData.username || '',
    email: initialData.email || '',
    token: initialData.token || '',
    verificationCode: initialData.verificationCode || '',
    password: initialData.password || '',
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showEmailCodeSended, setShowEmailCodeSended] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const sendEmailCodeMutation = api.account.useEmailCodeSignupSend();
  const sendEmailCodeLoginMutation = api.account.useEmailCodeLoginSend();
  const sendEmailCodeResetPasswordMutation = api.account.useEmailCodeResetPasswordSend();
  const { t } = useTranslation();

  const switchMode = useCallback((newMode: AuthMode) => {
    setFormData(prev => ({
      ...prev,
      mode: newMode,
    }));
    setErrors({});
    setShowVerification(false);
    setCountdown(0);
    setShowEmailCodeSended(false);
  }, [setFormData]);

  // 验证规则
  const validationRules = {
    username: [
      {
        condition: (formData: AuthFormData) => !formData.username.trim(),
        message: t('account.enter_username')
      },
      {
        condition: (formData: AuthFormData) => formData.username.length < 2,
        message: t('account.username_min_length')
      },
      {
        condition: (formData: AuthFormData) => formData.username.length > 20,
        message: t('account.username_max_length')
      }
    ],
    email: [
      {
        condition: (formData: AuthFormData) => !formData.email.trim(),
        message: t('account.enter_email_first')
      }
    ],
    token: [
      {
        condition: (formData: AuthFormData) => !formData.token.trim(),
        message: t('account.request_verification_code')
      }
    ],
    verificationCode: [
      {
        condition: (formData: AuthFormData) => !formData.verificationCode.trim(),
        message: t('account.enter_6_digit_code')
      }
    ],
    password: [
      {
        condition: (formData: AuthFormData) => !formData.password.trim(),
        message: t('account.enter_password_placeholder')
      }
    ]
  };

  const validateField = useCallback((fieldName: keyof typeof validationRules) => {
    const rules = validationRules[fieldName];
    for (const rule of rules) {
      if (rule.condition(formData)) {
        return rule.message;
      }
    }
    return '';
  }, [validationRules, formData]);

  const handleSendVerificationCode = useCallback(async () => {
    if (!formData.email) {
      setErrors({ email: t('account.enter_email_first') });
      return;
    }

    try {
      const token = formData.mode === 'signup'
        ? await sendEmailCodeMutation({ input: { email: formData.email, language: getClientLocale() } })
        : (formData.mode === 'forgot-password'
          ? await sendEmailCodeResetPasswordMutation({ input: { email: formData.email, language: getClientLocale() } })
          : await sendEmailCodeLoginMutation({ input: { email: formData.email, language: getClientLocale() } })
        )
      setShowEmailCodeSended(true);
      setErrors({});
      setFormData({ ...formData, token });
    } catch (error) {
      setErrors({ submit: getErrorMessage(error) });
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
  }, [formData, t, sendEmailCodeMutation, setShowEmailCodeSended, setErrors, setFormData, setCountdown, getClientLocale, getErrorMessage, sendEmailCodeResetPasswordMutation]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    showVerification,
    setShowVerification,
    validateField,
    showEmailCodeSended,
    setShowEmailCodeSended,
    countdown,
    setCountdown,
    handleSendVerificationCode,
  }
}