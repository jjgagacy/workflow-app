import api from "@/api";
import { getClientLocale } from "@/i18n";
import { getErrorMessage } from "@/utils/errors";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./use-auth";
import { useRouter } from "next/navigation";

export function useRegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    token: '',
    verificationCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showEmailCodeSended, setShowEmailCodeSended] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { t } = useTranslation();
  const validateUsernameMutation = api.account.useValidateUsername();
  const sendEmailCodeMutation = api.account.useEmailCodeSignupSend();
  const emailCodeSignUpMutaiton = api.account.useEmailCodeSignUp();
  const emailCodeLoginMutation = api.account.useEmailCodeLogin();
  const { login } = useAuth();
  const router = useRouter();

  // 验证规则
  const validationRules = {
    username: [
      {
        condition: !formData.username.trim(),
        message: t('account.enter_username')
      },
      {
        condition: formData.username.length < 2,
        message: t('account.username_min_length')
      },
      {
        condition: formData.username.length > 20,
        message: t('account.username_max_length')
      }
    ],
    email: [
      {
        condition: !formData.email.trim(),
        message: t('account.enter_email_first')
      }
    ],
    token: [
      {
        condition: !formData.token.trim(),
        message: t('account.request_verification_code')
      }
    ],
    verificationCode: [
      {
        condition: !formData.verificationCode.trim(),
        message: t('account.enter_6_digit_code')
      }
    ]
  };

  const validateField = (fieldName: keyof typeof validationRules) => {
    const rules = validationRules[fieldName];
    for (const rule of rules) {
      if (rule.condition) {
        return rule.message;
      }
    }
    return '';
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!showVerification) {
      const usernameError = validateField('username');
      if (usernameError) {
        newErrors.username = usernameError;
      }
    } else {
      const emailError = validateField('email');
      const tokenError = validateField('token');
      const codeError = validateField('verificationCode');

      if (emailError) newErrors.email = emailError;
      if (tokenError) newErrors.submit = tokenError;
      if (codeError) newErrors.verificationCode = codeError;
    }
    return newErrors;
  }

  const handleUsernameValidation = async () => {
    const result = await validateUsernameMutation({
      username: formData.username
    });

    if (!result) {
      throw new Error(t('account.registration_failed'));
    }

    setShowVerification(true);
  };

  const handleEmailCodeSignUp = async () => {
    const result = await emailCodeSignUpMutaiton({
      input: {
        username: formData.username,
        email: formData.email,
        code: formData.verificationCode,
        token: formData.token || 'aa',
      }
    });

    if (!result) {
      throw new Error(t('account.registration_failed'));
    }

    login(result.access_token, result.name, result.roles, result.isSuper, '');
    router.push('/admin');
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setErrors({ email: t('account.enter_email_first') });
      return;
    }

    try {
      const token = await sendEmailCodeMutation({ input: { email: formData.email, language: getClientLocale() } })
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    // if (Object.keys(formErrors).length > 0) {
    //   setErrors(formErrors);
    //   return;
    // }

    setErrors({});
    setIsLoading(true);

    try {
      if (!showVerification) {
        await handleUsernameValidation();
      } else {
        await handleEmailCodeSignUp();
      }
    } catch (err: any) {
      const errorField = !showVerification ? 'username' : 'submit';
      setErrors({ [errorField]: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  }


  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    showVerification,
    setShowVerification,
    handleSubmit,
    validateField,
    showEmailCodeSended,
    setShowEmailCodeSended,
    countdown,
    setCountdown,
    handleSendVerificationCode,
  };
};