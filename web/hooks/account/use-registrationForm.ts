import { useCallback } from "react";
import { useAuthForm } from "./use-authForm";
import api from "@/api";
import { useTranslation } from "react-i18next";
import { useAuth } from "../use-auth";
import { getErrorMessage } from "@/utils/errors";
import { useRouter } from "next/navigation";

export function useRegistrationForm() {
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
    setShowVerification,
    validateField,
    formData,
    setErrors,
    setIsLoading,
  } = base;

  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const validateUsernameMutation = api.account.useValidateUsername();
  const emailCodeSignUpMutaiton = api.account.useEmailCodeSignUp();

  const validateForm = useCallback(() => {
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
  }, [validateField, showVerification, formData]);

  const handleUsernameValidation = useCallback(async () => {
    const result = await validateUsernameMutation({
      username: formData.username
    });
    if (!result) {
      throw new Error(t('account.registration_failed'));
    }
    setShowVerification(true);
  }, [validateUsernameMutation, setShowVerification, formData.username]);

  const handleEmailCodeSignUp = useCallback(async () => {
    const result = await emailCodeSignUpMutaiton({
      input: {
        username: formData.username,
        email: formData.email,
        code: formData.verificationCode,
        token: formData.token,
      }
    });

    if (!result) {
      throw new Error(t('account.registration_failed'));
    }

    login(result.access_token, result.name, result.roles, result.isSuper, '');
    router.push('/admin');
  }, [emailCodeSignUpMutaiton, formData, login, router]);

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
  }, [validateForm, setErrors, setIsLoading, showVerification, handleUsernameValidation, handleEmailCodeSignUp, getErrorMessage, setIsLoading]);


  return {
    ...base,
    validateForm,
    handleSubmit,
  };
}
