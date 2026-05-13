import { useEffect } from "react";

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
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

        if (isInput) return;

        if (ctrlKey && !event.ctrlKey) return;
        if (shiftKey && !event.shiftKey) return;
        if (altKey && !event.altKey) return;

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

