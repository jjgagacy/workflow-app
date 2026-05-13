import { forwardRef, useMemo } from "react";
import { KeyboardShortcut } from "./shortcut";
import { useDeviceSupport } from "../../app/hooks";
import { cn } from "@/utils/classnames";

export const KeyboardShortcutDisplay = forwardRef<HTMLDivElement, { shortcut: KeyboardShortcut, className?: string }>
  (({ shortcut, className }, ref) => {
    const { isMac, ctrlKeyText } = useDeviceSupport();

    const keys = useMemo(() => {
      const allKeys = shortcut.keys.map(key => {
        // 特殊键的处理
        if (key === 'arrowup') return '↑';
        if (key === 'arrowdown') return '↓';
        if (key === 'arrowleft') return '←';
        if (key === 'arrowright') return '→';
        if (key === 'space') return '␣';
        if (key === 'enter') return '⏎';
        if (key === 'tab') return '⇥';
        if (key === 'backspace') return '⌫';
        if (key === 'escape') return '⎋';
        // 其他键默认显示，首字母大写
        return key.charAt(0).toUpperCase() + key.slice(1);
      });

      if (shortcut.metaKey) {
        allKeys.unshift(ctrlKeyText);
      }

      if (shortcut.ctrlKey) {
        allKeys.unshift('Ctrl');
      }

      if (shortcut.altKey) {
        allKeys.unshift(isMac ? '⌥' : 'Alt');
      }

      if (shortcut.shiftKey) {
        allKeys.unshift('⇧');
      }

      return allKeys;
    }, [shortcut, ctrlKeyText, isMac]);

    return (
      <div ref={ref} className={cn('flex items-center gap-0.5', className)}>
        {keys.map((key, index) => (
          <div
            key={index}
            className="flex justify-center items-center rounded-md h-[18px] min-w-[18px] px-1 border border-solid border-[var(--border)] bg-white dark:bg-neutral-800 shadow-sm"
          >
            <span className="text-[10px] leading-none text-neutral-700 dark:text-neutral-300 font-medium">
              {key}
            </span>
          </div>
        ))}
      </div>
    );
  });

KeyboardShortcutDisplay.displayName = 'KeyboardShortcutDisplay';