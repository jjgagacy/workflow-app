import { useEffect } from "react";
import { isTargetInputArea } from "../utils/node";

export const useKeyboardShortcut = (
  key: string,
  onPress: () => void,
  options?: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean, preventDefault?: boolean }
) => {
  const { ctrlKey = false, shiftKey = false, altKey = false, preventDefault = true } = options || {};

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase()) {
        const target = event.target as HTMLElement;

        if (isTargetInputArea(target)) return;

        if (event.ctrlKey !== ctrlKey) return;
        if (event.shiftKey !== shiftKey) return;
        if (event.altKey !== altKey) return;
        if (event.metaKey) return;

        if (preventDefault) {
          event.preventDefault();
        }

        onPress();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, onPress, ctrlKey, shiftKey, altKey, preventDefault]);
};

