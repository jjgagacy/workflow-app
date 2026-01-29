'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const COOKIE_NAME = 'active_theme';
const DEFAULT_APPEARANCE = 'default';

function setThemeCookie(theme: string) {
  if (typeof window === 'undefined') return false;

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}

type ActiveAppearanceContext = {
  activeAppearance: string;
  setActiveAppearance: (value: string) => void;
};

const ActiveAppearanceContext = createContext<ActiveAppearanceContext | undefined>(undefined);

export function AppearanceProvider({
  children, initial: initialTheme
}: { children: ReactNode; initial?: string }) {
  const [activeTheme, setActiveTheme] = useState<string>(
    () => initialTheme || DEFAULT_APPEARANCE
  );

  useEffect(() => {
    setThemeCookie(activeTheme);

    Array.from(document.body.classList)
      .filter(className => className.startsWith('theme-'))
      .forEach(className => {
        document.body.classList.remove(className);
      });

    document.body.classList.add(`theme-${activeTheme}`);

    if (activeTheme.endsWith('-scaled')) {
      document.body.classList.add('theme-scaled');
    }
  }, [activeTheme]);

  return (
    <ActiveAppearanceContext.Provider value={{ activeAppearance: activeTheme, setActiveAppearance: setActiveTheme }}>
      {children}
    </ActiveAppearanceContext.Provider>
  );
}

export function useActiveAppearance() {
  const context = useContext(ActiveAppearanceContext);
  if (context === undefined) {
    throw new Error('useActiveTheme must be used within an ActiveThemeProvider');
  }
  return context;
}

