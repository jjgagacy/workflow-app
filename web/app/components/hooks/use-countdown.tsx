import { useCallback, useEffect, useState } from "react";

export function useCountDown(initialCount: number) {
  const [countdown, setCountdown] = useState(initialCount);
  const [isActive, setIsActive] = useState(false);

  const reset = useCallback((newCount?: number) => {
    setCountdown(newCount ?? initialCount);
    setIsActive(true);
  }, [initialCount]);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  useEffect(() => {
    setCountdown(initialCount);
    setIsActive(true);
  }, [initialCount]);

  useEffect(() => {
    if (!isActive || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isActive]);

  return { countdown, isActive, reset, stop };
}

