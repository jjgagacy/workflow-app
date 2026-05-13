import { useEffect } from "react";

export function useGlobalEventListener<K extends keyof GlobalEventHandlersEventMap>(
  eventName: K,
  handler: (event: GlobalEventHandlersEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    const eventHandler = (event: GlobalEventHandlersEventMap[K]) => handler(event);
    const target = typeof window !== 'undefined' ? window : globalThis;
    target.addEventListener(eventName, eventHandler, options);
    return () => {
      target.removeEventListener(eventName, eventHandler, options);
    };
  }, [eventName, handler, options]);
}

// 安全地获取全局对象
export const getGlobalTarget = (): EventTarget => {
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof globalThis !== 'undefined') {
    return globalThis as unknown as EventTarget;
  }
  // 降级方案
  return document;
};