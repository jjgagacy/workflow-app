// providers/theme-provider.tsx
'use client';

import { AppearanceType } from '@/types/appearance';
import { ThemeType } from '@/types/theme';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import { createContext, useContext, useEffect, useState } from 'react';

// 定义主题类型
export type ColorTheme = ThemeType;
export type AppearanceTheme = AppearanceType;

interface ThemeContextType {
  colorTheme: ColorTheme;
  appearanceTheme: AppearanceTheme;
  setColorTheme: (theme: ColorTheme) => void;
  setAppearanceTheme: (theme: AppearanceTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 自定义 Hook
export function useCustomTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within ThemeProvider');
  }
  return context;
}

function ThemeManager({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default');
  const [appearanceTheme, setAppearanceTheme] = useState<AppearanceTheme>('system');

  // 初始化
  useEffect(() => {
    // 从 localStorage 读取设置
    const savedColorTheme = localStorage.getItem('color-theme') as ColorTheme | null;
    const savedAppearanceTheme = localStorage.getItem('appearance-theme') as AppearanceTheme | null;

    if (savedColorTheme) {
      setColorTheme(savedColorTheme);
      document.documentElement.setAttribute('data-theme', savedColorTheme);
    }

    if (savedAppearanceTheme) {
      setAppearanceTheme(savedAppearanceTheme);

      if (savedAppearanceTheme !== 'system') {
        setNextTheme(savedAppearanceTheme);
      } else {
        // 跟随系统
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setNextTheme(isSystemDark ? 'dark' : 'light');
      }
    }
  }, [setNextTheme]);

  // 更新颜色主题
  const updateColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('color-theme', theme);
  };

  // 更新外观主题
  const updateAppearanceTheme = (theme: AppearanceTheme) => {
    setAppearanceTheme(theme);
    localStorage.setItem('appearance-theme', theme);

    if (theme !== 'system') {
      setNextTheme(theme);
    } else {
      // 跟随系统
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setNextTheme(isSystemDark ? 'dark' : 'light');
    }
  };

  // 监听系统外观变化
  useEffect(() => {
    if (appearanceTheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setNextTheme(isSystemDark ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearanceTheme, setNextTheme]);

  return (
    <ThemeContext.Provider value={{
      colorTheme,
      appearanceTheme,
      setColorTheme: updateColorTheme,
      setAppearanceTheme: updateAppearanceTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeManager>
        {children}
      </ThemeManager>
    </NextThemesProvider>
  );
}