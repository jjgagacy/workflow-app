import { useEffect, useState } from "react";

export const useDeviceSupport = () => {
  const [isMac, setIsMac] = useState(false);
  const [modKey, setModKey] = useState<'meta' | 'ctrl'>('ctrl');
  const [ctrlKeyText, setCtrlKeyText] = useState('Ctrl');

  useEffect(() => {
    const platform = globalThis.navigator.platform.toLowerCase();
    const isMacPlatform = platform.includes('mac');
    setIsMac(isMacPlatform);
    setModKey(isMacPlatform ? 'meta' : 'ctrl');
    setCtrlKeyText(isMacPlatform ? '⌘' : 'Ctrl');
  }, []);

  return { isMac, modKey, ctrlKeyText };
}
