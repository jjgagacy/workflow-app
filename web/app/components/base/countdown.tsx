import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./button";
import { useCountDown } from "../hooks/use-countdown";

interface CountdownProps {
  onResend?: () => Promise<boolean>;
  loading?: boolean;
  initialCount?: number;
}

export interface CountdownRef {
  reset: (newCount?: number) => void;
  stop: () => void;
}

const DEFAULT_COUNT = 59;

const Countdown = forwardRef<CountdownRef, CountdownProps>(({ onResend, loading = false, initialCount = DEFAULT_COUNT }: CountdownProps, ref) => {
  const { countdown, reset } = useCountDown(initialCount);
  const { t } = useTranslation();

  useImperativeHandle(ref, () => ({
    reset,
    stop: () => { }
  }), [reset]);

  const resend = async function () {
    try {
      const resendSuccess = await onResend?.();
      if (resendSuccess === false) {
        reset(0);
        return;
      }
      reset(DEFAULT_COUNT);
    } catch (error) {
      reset(0);
    }
  }

  return (
    <div className="text-sm text-gray-500">
      {countdown > 0 ? (
        <span>
          {t('account.countdown.seconds_to_resend', { count: countdown })}
        </span>
      ) : (
        <p className="flex items-center">
          {t('account.countdown.didnot_receive_code')}
          <Button
            onClick={resend}
            disabled={loading}
            loading={loading}
            variant={'link'}
            className="pl-0 text-green-600"
          >
            {t('account.countdown.resend')}
          </Button>
        </p>
      )}
    </div>
  );
});

export default Countdown;
