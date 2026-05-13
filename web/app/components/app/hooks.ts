import { useEffect, useState } from "react";

export const useDeviceSupport = () => {
  const [isMac, setIsMac] = useState(false);
  const [ctrlKeyText, setCtrlKeyText] = useState('Ctrl');

  useEffect(() => {
    const platform = globalThis.navigator.platform.toLowerCase();
    setIsMac(platform.includes('mac'));
    setCtrlKeyText(platform.includes('mac') ? '⌘' : 'Ctrl');
  }, []);

  return { isMac, ctrlKeyText };
}
