import api from "@/api";
import Button from "@/app/components/base/button";
import Countdown, { CountdownRef } from "@/app/components/base/countdown";
import { Dialog } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface AccountDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail: string;
}

type Step = 'warning' | 'verification' | 'confirm';

export default function AccountDeleteDialog({
  isOpen,
  onClose,
  onSuccess,
  userEmail
}: AccountDeleteProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('warning');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const countdownRef = useRef<CountdownRef>(null);
  const useDeleteAccountEmailSend = api.account.useDeleteAccountEmailSend();
  const useDeleteAccount = api.account.useDeleteAccount();
  const useValidateDeleteAccountEmailCode = api.account.useValidateDeleteAccountEmailCode();
  const [stepToken, setStepToken] = useState<string>('');

  // 发送验证码
  const sendVerificationCode = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const token = await useDeleteAccountEmailSend({ input: {} });
      setStepToken(token);
      return true;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const verifyCode = async (): Promise<boolean> => {
    if (!verificationCode.trim()) {
      setVerificationError(t('account.delete.verification_code_required'));
      return false;
    }

    try {
      setLoading(true);
      // 调用 API 验证验证码
      const newToken = await useValidateDeleteAccountEmailCode({ input: { token: stepToken, code: verificationCode } });
      setStepToken(newToken);
      return true;
    } catch (error) {
      setVerificationError(t('account.delete.verification_failed'));
    } finally {
      setLoading(false);
    }
    return false;
  };

  // 处理发送验证码
  const handleSendCode = () => {
    setStep('verification');
    // 发送验证码
    sendVerificationCode();
  };

  // 处理验证码提交
  const handleVerifyCode = async () => {
    const isValid = await verifyCode();
    if (isValid) {
      setStep('confirm');
      setVerificationError('');
    }
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await useDeleteAccount({ input: { token: stepToken, code: verificationCode } });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 重置弹窗
  const handleClose = () => {
    setStep('warning');
    setVerificationCode('');
    setVerificationError('');
    onClose();
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    await sendVerificationCode();
    if (countdownRef.current) {
      countdownRef.current.reset();
    }
    return true;
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        isLoading={loading}
        title={t('account.delete.title')}
        description=""
        confirmText={t('system.confirm')}
        cancelText={t('system.cancel')}
        onConfirm={() => { }}
        onCancel={onClose}
        actions={false}
      >
        {/* 警告步骤 */}
        {step === 'warning' && (
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {t('account.delete.warning_title')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-700">
                {t('account.delete.warning_description')}
              </p>

              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li>{t('account.delete.warning_1')}</li>
                <li>{t('account.delete.warning_2')}</li>
                <li>{t('account.delete.warning_3')}</li>
                <li>{t('account.delete.warning_4')}</li>
              </ul>

              <p className="text-sm text-gray-500 mt-4">
                {t('account.delete.verification_will_send', { email: userEmail })}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant={'ghost'}
                onClick={handleClose}
              >
                {t('app.actions.cancel')}
              </Button>
              <Button
                variant={'alert'}
                onClick={handleSendCode}
                loading={loading}
              >
                {t('account.delete.continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'verification' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-700">
                {t('account.delete.verification_sent', { email: userEmail })}
              </p>
              <p className="text-sm text-gray-500">
                {t('account.delete.verification_instruction')}
              </p>
            </div>

            <div className="space-y-3">
              <Input
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setVerificationError('');
                }}
                placeholder={t('account.delete.verification_code')}
                maxLength={6}
              />

              {verificationError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {verificationError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Countdown
                  ref={countdownRef}
                  initialCount={59}
                  onResend={handleResendCode}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant={'ghost'}
                onClick={() => setStep('warning')}
              >
                {t('app.actions.back')}
              </Button>
              <Button
                variant="primary"
                onClick={handleVerifyCode}
                loading={loading}
                disabled={!verificationCode.trim()}
              >
                {t('app.actions.verify')}
              </Button>
            </div>
          </div>
        )}

        {/* 确认步骤 */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-2">❗</span>
                <div>
                  <p className="font-medium text-red-800">
                    {t('account.delete.confirm_title')}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {t('account.delete.confirm_warning')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-700">
                {t('account.delete.confirm_description')}
              </p>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  {t('account.delete.confirm_note')}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant={'ghost'}
                onClick={() => setStep('verification')}
              >
                {t('app.actions.back')}
              </Button>
              <Button
                variant={'alert'}
                onClick={handleConfirmDelete}
                loading={loading}
              >
                {t('account.delete.confirm_button')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}