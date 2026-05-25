import { useMemo } from "react";
import { useDeviceSupport } from "../../app/hooks";
import { useKeyPress } from "ahooks";
import { isTargetInputArea } from "../utils/node";

type PlatformShortcutOptions = {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  exactMatch?: boolean;
  useCapture?: boolean;
  enableOnInput?: boolean;
};

export const usePlatformShortcut = (
  key: string | string[],
  onPress: (event: KeyboardEvent) => void,
  options?: PlatformShortcutOptions,
) => {
  const { modKey } = useDeviceSupport();
  const {
    shiftKey = false,
    altKey = false,
    ctrlKey = false,
    metaKey = true,
    preventDefault = true,
    exactMatch = true,
    useCapture = false,
    enableOnInput = false,
  } = options || {};

  // 生成单个快捷键组合
  const buildShortcut = (singleKey: string): string => {
    const keys: string[] = [];

    if (shiftKey) keys.push('shift');
    if (altKey) keys.push('alt');
    if (metaKey && modKey === 'meta') keys.push('meta');
    if (ctrlKey || (metaKey && modKey === 'ctrl')) keys.push('ctrl');

    keys.push(singleKey.toLowerCase());
    return keys.join('.');
  };

  // 根据 key 类型生成 shortcut（字符串或数组）
  const shortcut = useMemo(() => {
    if (Array.isArray(key)) {
      return key.map(buildShortcut);
    }
    return buildShortcut(key);
  }, [altKey, ctrlKey, key, metaKey, modKey, shiftKey]);

  useKeyPress(shortcut, (event) => {
    const target = event.target as HTMLElement | null;

    if (!enableOnInput && target && isTargetInputArea(target)) {
      return;
    }

    if (preventDefault) event.preventDefault();
    onPress(event);
  }, { exactMatch, useCapture });
};