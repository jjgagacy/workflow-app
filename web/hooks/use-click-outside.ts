import { useEffect, useRef } from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  ignoreRefs: React.RefObject<HTMLElement>[]
) {
  if (!ref) return;
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node;

      // 检查是否点击在弹框内
      if (ref.current?.contains(target)) return;

      // 检查是否点击在忽略元素内
      for (const ignoreRef of ignoreRefs) {
        if (ignoreRef.current?.contains(target)) return;
      }

      handler();
    };

    globalThis.document.addEventListener('click', listener);
    return () => globalThis.document.removeEventListener('click', listener);
  }, [ref, handler, ignoreRefs]);
}
