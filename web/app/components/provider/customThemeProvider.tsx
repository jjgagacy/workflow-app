'use client';

import { AppearanceType } from "@/types/appearance";
import { ThemeType } from "@/types/theme";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const COOKIE_NAME = 'active_theme';
const DEFAULT_THEME = 'system';
const COLOR_THEME_NAME = 'active_color_theme';
const DEFAULT_COLOR_THEME = 'default';

function setThemeCookie(theme: string) {
  if (typeof window === 'undefined') return false;
  // console.log('Setting theme cookie:', COOKIE_NAME, '=', theme);

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}

function setColorThemeCookie(colorTheme: string) {
  if (typeof window === 'undefined') return false;
  // console.log('Setting color theme cookie:', COLOR_THEME_NAME, '=', colorTheme);

  document.cookie = `${COLOR_THEME_NAME}=${colorTheme}; path=/; max-age=31536000; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
}

type ActiveThemeContext = {
  activeTheme: AppearanceType;
  setActiveTheme: (value: string) => void;
  activeColorTheme: ThemeType;
  setActiveColorTheme: (value: string) => void;
};

const ActiveThemeContext = createContext<ActiveThemeContext | undefined>(undefined);

export function CustomThemeProvider({
  children,
  initialTheme,
  initialColorTheme
}: { children: ReactNode; initialTheme?: string, initialColorTheme?: string }) {
  console.log(',,', initialColorTheme)
  const [activeTheme, setActiveTheme] = useState<string>(
    () => initialTheme || DEFAULT_THEME
  );
  const [activeColorTheme, setActiveColorTheme] = useState<string>(
    () => initialColorTheme || DEFAULT_COLOR_THEME
  );

  useEffect(() => {
    setColorThemeCookie(activeColorTheme);

    Array.from(document.body.classList)
      .filter(className => className.startsWith('theme-'))
      .forEach(className => {
        document.body.classList.remove(className);
      });

    document.body.classList.add(`theme-${activeColorTheme}`);

    if (activeColorTheme.endsWith('-scaled')) {
      document.body.classList.add('theme-scaled');
    }
  }, [activeColorTheme]);

  useEffect(() => {
    setThemeCookie(activeTheme);
  }, [activeTheme]);

  return (
    <ActiveThemeContext.Provider value={{
      activeTheme: activeTheme as AppearanceType,
      setActiveTheme,
      activeColorTheme: activeColorTheme as ThemeType,
      setActiveColorTheme
    }}>
      {children}
    </ActiveThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(ActiveThemeContext);
  if (context === undefined) {
    throw new Error('useActiveTheme must be used within an ActiveThemeProvider');
  }
  return context;
}

