'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppearanceType } from '@/types/appearance';
import { useAppearance } from '@/hooks/use-appearance';


export default function AppearanceToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const {
    resolvedTheme,
    selectAppearance,
    appearanceOptions,
    currentAppearanceIcon,
  } = useAppearance();

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


  const handleThemeSelect = (selectedTheme: AppearanceType) => {
    selectAppearance(selectedTheme);
    setIsOpen(false);
  };

  const getAppearanceIcon = (size: number = 4) => {
    const Icon = currentAppearanceIcon;
    return <Icon className={`w-${size} h-${size}`} />;
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
        title={t('app.theme.current_theme', { theme: resolvedTheme })}
      >
        {getAppearanceIcon(4)}
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
            {appearanceOptions.map((option) => (
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
                  ${resolvedTheme === option.value
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
                aria-label={option.label}
              >
                <div className={`p-1.5 rounded ${resolvedTheme === option.value ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <option.icon className={`w-4 h-4`} />
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