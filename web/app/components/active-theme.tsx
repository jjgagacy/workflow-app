'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const COOKIE_NAME = 'active_theme';
const DEFAULT_THEME = 'default';

function setThemeCookie(theme: string) {
  if (typeof window === 'undefined') return false;

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}

type ActiveThemeContext = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ActiveThemeContext = createContext<ActiveThemeContext | undefined>(undefined);

export function ActiveThemeProvider({
  children, initialTheme
}: { children: ReactNode; initialTheme?: string }) {
  const [activeTheme, setActiveTheme] = useState<string>(
    () => initialTheme || DEFAULT_THEME
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
    <ActiveThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ActiveThemeContext.Provider>
  );
}

export function useActiveTheme() {
  const context = useContext(ActiveThemeContext);
  if (context === undefined) {
    throw new Error('useActiveTheme must be used within an ActiveThemeProvider');
  }
  return context;
}

