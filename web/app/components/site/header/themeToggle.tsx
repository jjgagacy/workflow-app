'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useActiveTheme } from '@/app/components/active-theme';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

type Theme = 'system' | 'light' | 'dark';

export default function ThemeToggle() {
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeTheme, setActiveTheme } = useActiveTheme();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  // 初始化主题
  useEffect(() => {
    const initialTheme = theme || 'system';
    setActiveTheme(initialTheme);
    applyTheme(initialTheme as Theme);
  }, [activeTheme]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (selectedTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        setResolvedTheme('dark');
      } else {
        setResolvedTheme('light');
      }
    } else if (selectedTheme === 'dark') {
      setResolvedTheme('dark');
    } else {
      setResolvedTheme('light');
    }
  };

  const handleThemeSelect = (selectedTheme: Theme) => {
    setActiveTheme(selectedTheme);
    applyTheme(selectedTheme);
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode, description: string; }[] = [
    {
      value: 'system',
      label: resolvedTheme === 'light' ? t('app.theme.system_light') : t('app.theme.system_dark'),
      icon: <Monitor className="w-4 h-4" />,
      description: t('theme.descriptions.system')
    },
    {
      value: 'light',
      label: t('app.theme.light'),
      icon: <Sun className="w-4 h-4" />,
      description: t('theme.descriptions.light')
    },
    {
      value: 'dark',
      label: t('app.theme.dark'),
      icon: <Moon className="w-4 h-4" />,
      description: t('theme.descriptions.dark')
    }
  ];

  const getCurrentIcon = () => {
    if (activeTheme === 'system') {
      return <Monitor className="w-5 h-5" />;
    } else if (activeTheme === 'light') {
      return <Sun className="w-5 h-5" />;
    } else {
      return <Moon className="w-5 h-5" />;
    }
  };

  const getCurrentTheme = () => {
    return themeOptions.find(option => option.value === activeTheme) || themeOptions[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center space-x-1
          p-2 rounded-lg 
          hover:bg-gray-100 dark:hover:bg-gray-800 
          transition-colors
        "
        aria-label={t('app.theme.select_theme')}
        aria-expanded={isOpen}
        title={t('app.theme.current_theme', { theme: getCurrentTheme().label })}
      >
        {getCurrentIcon()}
      </button>

      {isOpen && (
        <div className="
          absolute right-0 mt-2 
          w-48 
          bg-white dark:bg-gray-800 
          rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 
          z-50 
          animate-[fadeIn_0.2s_ease-out]
        ">
          <div className="p-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeSelect(option.value)}
                className={`
                  w-full 
                  flex items-center space-x-3 
                  px-3 py-2 
                  rounded-md 
                  text-left 
                  transition-colors
                  ${activeTheme === option.value
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
                aria-label={option.label}
              >
                <div className={`p-1.5 rounded ${activeTheme === option.value ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {option.icon}
                </div>
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}