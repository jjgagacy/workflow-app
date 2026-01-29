import { useCallback, useState } from "react";
import { useAuthForm } from "./use-authForm";
import api from "@/api";
import { getErrorMessage } from "@/utils/errors";
import { useTranslation } from "react-i18next";
import { useAuth } from "../use-auth";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(true);
  const { t } = useTranslation();
  const { login, logout, setCurrentTenant } = useAuth();
  const router = useRouter();
  const base = useAuthForm({
    mode: 'login',
    initialData: {
      email: '',
      token: '',
      verificationCode: '',
    }
  });

  const {
    showVerification,
    validateField,
    formData,
    setErrors,
    setIsLoading,
    setShowVerification,
    handleSendVerificationCode,
  } = base;

  const emailCodeLoginMutaiton = api.account.useEmailCodeLogin();
  const validateEmailMutation = api.account.useValidateEmail();
  const emailPasswordLoginMutation = api.account.useEmailPasswordLogin();

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (usePassword) {
      const passwordError = validateField('password');
      if (passwordError) newErrors.password = passwordError;
    } else if (!showVerification) {
      const emailError = validateField('email');
      if (emailError) newErrors.email = emailError;
    } else {
      const tokenError = validateField('token');
      const codeError = validateField('verificationCode');

      if (tokenError) newErrors.submit = tokenError;
      if (codeError) newErrors.verificationCode = codeError;
    }
    return newErrors;
  }, [showVerification, formData, validateField]);

  const handleEmailValidation = useCallback(async () => {
    const result = await validateEmailMutation({ email: formData.email });
    if (!result) {
      throw new Error(t('account.email_check_error'));
    }
    setShowVerification(true);
  }, [validateEmailMutation, formData.email, setShowVerification]);

  const handleEmailCodeLogin = useCallback(async () => {
    const result = await emailCodeLoginMutaiton({
      input: {
        email: formData.email,
        code: formData.verificationCode,
        token: formData.token,
      }
    });
    if (!result) {
      throw new Error(t('account.login_failed'));
    }

    login(result.access_token, result.name, result.roles, result.isSuper, '');
  }, [emailCodeLoginMutaiton, formData]);

  const handleEmailPasswordLogin = useCallback(async () => {
    const result = await emailPasswordLoginMutation({
      input: {
        email: formData.email,
        password: formData.password,
      }
    });
    if (!result) {
      throw new Error(t('account.login_failed'));
    }
    login(result.access_token, result.name, result.roles, result.isSuper, '');
  }, [emailPasswordLoginMutation, formData.email, formData.password]);

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
      if (usePassword) {
        await handleEmailPasswordLogin();
      } else if (!showVerification) {
        await handleEmailValidation();
        await handleSendVerificationCode();
      } else {
        await handleEmailCodeLogin();
      }
      router.push('/workspace/select');
    } catch (err: any) {
      const errorField = !showVerification ? 'email' : 'submit';
      setErrors({ [errorField]: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, setErrors, setIsLoading, showVerification, getErrorMessage, setIsLoading]);

  return {
    ...base,
    showPassword,
    setShowPassword,
    usePassword,
    setUsePassword,
    validateForm,
    handleSubmit,
  };
}
