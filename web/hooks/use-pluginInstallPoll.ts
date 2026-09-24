'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useCheckPluginInstallationTask } from '@/api/graphql/plugin';
import { getErrorMessage } from '@/utils/errors';

const DEFAULT_POLL_INTERVAL = 2000;
const DEFAULT_TIMEOUT_MS = 60_000;

export function usePluginInstallPoll(
  pollInterval = DEFAULT_POLL_INTERVAL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  const checkPluginInstallationTask = useCheckPluginInstallationTask();
  // 维护一个 active 标志，用于组件卸载时取消后续轮询
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const waitForPluginInstallation = useCallback(
    async (taskId: string) => {
      const startedAt = Date.now();

      while (Date.now() - startedAt < timeoutMs) {
        // 如果组件已被卸载，直接中断执行
        if (!isMountedRef.current) {
          throw new Error('Plugin installation aborted because component unmounted.');
        }
        try {
          const res = await checkPluginInstallationTask({ taskId }, {
            onError: (err) => {
              throw new Error(getErrorMessage(err) || 'Plugin installation failed.');
            }
          });
          // 1. 安装成功
          if (res?.success) {
            return true;
          }
        } catch (err) {
          throw new Error(getErrorMessage(err) || 'Plugin installation failed.');
        }

        // 3. 等待下一次轮询，并确保 sleep 期间可以响应卸载
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      throw new Error('Plugin installation timed out. Please try again later.');
    },
    [checkPluginInstallationTask, pollInterval, timeoutMs],
  );

  return {
    waitForPluginInstallation,
  };
}