import { useMemo } from "react";
import { useDeviceSupport } from "../../app/hooks";
import { useKeyPress } from "ahooks";

type PlatformShortcutOptions = {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  exactMatch?: boolean;
  useCapture?: boolean;
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
  } = options || {};

  // 修改：生成单个快捷键组合
  const buildShortcut = (singleKey: string): string => {
    const keys: string[] = [];

    if (shiftKey) keys.push('shift');
    if (altKey) keys.push('alt');
    if (metaKey && modKey === 'meta') keys.push('meta');
    if (ctrlKey || (metaKey && modKey === 'ctrl')) keys.push('ctrl');

    keys.push(singleKey.toLowerCase());
    return keys.join('.');
  };

  // 修改：根据 key 类型生成 shortcut（字符串或数组）
  const shortcut = useMemo(() => {
    if (Array.isArray(key)) {
      return key.map(buildShortcut);
    }
    return buildShortcut(key);
  }, [altKey, ctrlKey, key, metaKey, modKey, shiftKey]);

  // useKeyPress 本身就支持数组，直接传入即可
  useKeyPress(shortcut, (event) => {
    if (preventDefault) event.preventDefault();
    onPress(event);
  }, { exactMatch, useCapture });
};