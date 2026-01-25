import api from "@/api";
import Button from "@/app/components/base/button";
import { Dialog } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { getErrorMessage } from "@/utils/errors";
import { DialogTitle } from "@headlessui/react";
import { CheckCircleIcon, MailIcon, ShieldCheck, ShieldCheckIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ChangeEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentEmail: string;
}

type Step = 'verify-old' | 'set-new';

export default function ChangeEmailDialog({
  isOpen,
  onClose,
  onSuccess,
  currentEmail
}: ChangeEmailDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('verify-old');
  const [loading, setLoading] = useState(false);
  const useChangeEmailOld = api.account.useChangeEmailOldSend();
  const useValidatechangeEmailOld = api.account.useValidateEmailOld();
  const useConfirmEmailNew = api.account.useConfirmEmailNewSend();
  const useUpdateAccountNewEmail = api.account.useUpdateAccountNewEmail();

  // 第一步：验证旧邮箱
  const [oldEmailCode, setOldEmailCode] = useState('');
  const [oldEmailCountdown, setOldEmailCountdown] = useState(0);
  const [oldEmailSent, setOldEmailSent] = useState(false);

  // 第二步：设置新邮箱
  const [newEmail, setNewEmail] = useState('');
  const [newEmailCode, setNewEmailCode] = useState('');
  const [newEmailCountdown, setNewEmailCountdown] = useState(0);
  const [newEmailSent, setNewEmailSent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 用于自动聚焦
  const oldEmailCodeRef = useRef<HTMLInputElement>(null);
  const newEmailRef = useRef<HTMLInputElement>(null);
  const newEmailCodeRef = useRef<HTMLInputElement>(null);

  const [stepToken, setStepToken] = useState<string>('');

  // 重置状态
  const resetState = () => {
    setStep('verify-old');
    setOldEmailCode('');
    setOldEmailCountdown(0);
    setOldEmailSent(false);
    setNewEmail('');
    setNewEmailCode('');
    setNewEmailCountdown(0);
    setNewEmailSent(false);
    setErrors({});
  };

  // 组件关闭时重置
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // 倒计时处理
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (oldEmailCountdown > 0) {
      timer = setTimeout(() => {
        setOldEmailCountdown(oldEmailCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [oldEmailCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (newEmailCountdown > 0) {
      timer = setTimeout(() => {
        setNewEmailCountdown(newEmailCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [newEmailCountdown]);

  // 发送旧邮箱验证码
  const sendOldEmailCode = async () => {
    setLoading(true);
    setErrors({});

    try {
      const token = await useChangeEmailOld({ input: {} });
      setStepToken(token);
      setOldEmailSent(true);
      setOldEmailCountdown(60);
    } catch (error: any) {
      setErrors({ send: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // 验证旧邮箱验证码
  const verifyOldEmailCode = async () => {
    if (!oldEmailCode.trim()) {
      setErrors({ code: t('account.change_email.error_code_required') });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const newToken = await useValidatechangeEmailOld({ input: { token: stepToken, code: oldEmailCode } });
      setStepToken(newToken);
      setStep('set-new');
      setTimeout(() => {
        newEmailRef.current?.focus();
      }, 100);
    } catch (error) {
      setErrors({ code: t('account.change_email.error_code_invalid') });
    } finally {
      setLoading(false);
    }
  };

  // 发送新邮箱验证码
  const sendNewEmailCode = async () => {
    if (!newEmail.trim()) {
      setErrors({ newEmail: t('account.change_email.error_email_required') });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setErrors({ newEmail: t('account.change_email.error_email_invalid') });
      return;
    }

    if (newEmail === currentEmail) {
      setErrors({ newEmail: t('account.change_email.error_email_same') });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = await useConfirmEmailNew({ input: { token: stepToken, newEmail, code: oldEmailCode } });
      setStepToken(token);
      setNewEmailSent(true);
      setNewEmailCountdown(60);
    } catch (error) {
      setErrors({ sendNew: t('account.change_email.error_send_failed') });
    } finally {
      setLoading(false);
    }
  };

  // 提交更改
  const submitChangeEmail = async () => {
    if (!newEmailCode.trim()) {
      setErrors({ newCode: t('account.change_email.error_code_required') });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await useUpdateAccountNewEmail({ input: { token: stepToken, newEmail, code: newEmailCode } });
      onSuccess?.();
      onClose();
    } catch (error) {
      setErrors({ submit: t('account.change_email.error_verification_failed') });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        isLoading={loading}
        title={t('account.change_email.title')}
        description=""
        confirmText={t('system.confirm')}
        cancelText={t('system.cancel')}
        onConfirm={() => { }}
        onCancel={onClose}
        actions={false}
      >
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              {/* 第一步 */}
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-green-500 bg-green-50 text-green-500`}>
                  {step === 'verify-old' ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="mt-2 text-sm text-gray-600">
                  {t('account.change_email.step_verify_old')}
                </span>
              </div>

              <div className={`w-16 h-0.5 mx-2 ${step === 'set-new' ? 'bg-green-500' : 'bg-gray-300'}`} />

              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 'verify-old'
                  ? 'border-gray-300 text-gray-400'
                  : 'border-green-500 bg-green-50 text-green-500'
                  }`}>
                  <MailIcon className="h-5 w-5" />
                </div>
                <span className={`mt-2 text-sm ${step === 'verify-old' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  {t('account.change_email.step_set_new')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {errors.send && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errors.send}
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errors.submit}
          </div>
        )}

        {/* 第一步：验证旧邮箱 */}
        {step === 'verify-old' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {t('account.change_email.old_email_description', { email: currentEmail })}
            </div>

            {!oldEmailSent ? (
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <Button
                    onClick={sendOldEmailCode}
                    disabled={loading}
                    loading={loading}
                    className="flex-1 disabled:cursor-not-allowed"
                    size={'large'}
                  >
                    {loading
                      ? t('account.change_email.sending')
                      : t('account.change_email.send_code')
                    }
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="oldEmailCode" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('account.change_email.verification_code')}
                  </label>
                  <Input
                    ref={oldEmailCodeRef}
                    type="text"
                    id="oldEmailCode"
                    value={oldEmailCode}
                    onChange={(e) => setOldEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('account.change_email.verification_code_placeholder')}
                    className={`w-full  ${errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={loading}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                {/* 倒计时和重发 */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {oldEmailCountdown > 0 ? (
                      <span>
                        {t('account.change_email.seconds_to_resend', { count: oldEmailCountdown })}
                      </span>
                    ) : (
                      <Button
                        onClick={sendOldEmailCode}
                        disabled={loading}
                        variant={'ghost'}
                      >
                        {t('account.change_email.resend_code')}
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={verifyOldEmailCode}
                    disabled={loading || !oldEmailCode.trim()}
                    className="font-medium  disabled:cursor-not-allowed"
                  >
                    {loading
                      ? t('account.change_email.verifying')
                      : t('account.change_email.next_step')
                    }
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 第二步：设置新邮箱 */}
        {step === 'set-new' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                {t('account.change_email.new_email_label')}
              </label>
              <Input
                ref={newEmailRef}
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (errors.newEmail) setErrors({ ...errors, newEmail: '' });
                }}
                placeholder={t('account.change_email.new_email_placeholder')}
                className={`w-full border ${errors.newEmail ? 'border-red-300' : 'border-gray-300'}`}
                disabled={newEmailSent || loading}
              />
              {errors.newEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.newEmail}</p>
              )}
            </div>

            {/* 发送新邮箱验证码 */}
            {!newEmailSent ? (
              <Button
                onClick={sendNewEmailCode}
                disabled={loading || !newEmail.trim()}
                className="w-full font-medium disabled:cursor-not-allowed"
                size={'large'}
              >
                {loading
                  ? t('account.change_email.sending')
                  : t('account.change_email.send_code')
                }
              </Button>
            ) : (
              <>
                <div>
                  <label htmlFor="newEmailCode" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('account.change_email.new_verification_code')}
                  </label>
                  <Input
                    ref={newEmailCodeRef}
                    type="text"
                    id="newEmailCode"
                    value={newEmailCode}
                    onChange={(e) => {
                      setNewEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (errors.newCode) setErrors({ ...errors, newCode: '' });
                    }}
                    placeholder={t('account.change_email.new_verification_code_placeholder')}
                    className={`w-full ${errors.newCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={loading}
                  />
                  {errors.newCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.newCode}</p>
                  )}
                </div>

                {/* 倒计时和操作按钮 */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    {newEmailCountdown > 0 ? (
                      <span>
                        {t('account.change_email.seconds_to_resend', { count: newEmailCountdown })}
                      </span>
                    ) : (
                      <Button
                        onClick={sendNewEmailCode}
                        disabled={loading}
                        loading={loading}
                        variant={'ghost'}
                      >
                        {t('account.change_email.resend_code')}
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setStep('verify-old')}
                      disabled={loading}
                      className="flex-1 font-medium"
                      variant={'secondary'}
                    >
                      {t('account.change_email.previous_step')}
                    </Button>
                    <Button
                      onClick={submitChangeEmail}
                      disabled={loading || !newEmailCode.trim()}
                      className="flex-1 font-medium"
                    >
                      {loading
                        ? t('account.change_email.submitting')
                        : t('account.change_email.submit_changes')
                      }
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 安全提示 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-start space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              {t('account.change_email.security_tip')}
            </p>
          </div>
        </div>

      </Dialog>
    </>
  )
}