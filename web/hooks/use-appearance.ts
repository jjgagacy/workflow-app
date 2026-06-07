'use client';

import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { AppearanceOptions, AppearanceType } from "@/types/appearance";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePersistentState } from "./use-persistent-state";
import { APPEARANCE_DEFAULT_STORAGE_KEY } from "@/config/storage";
import React from "react";

// Constants
const APPEARANCE_VALUES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
} as const;

const APPEARANCE_ICONS = {
  [APPEARANCE_VALUES.SYSTEM]: Monitor,
  [APPEARANCE_VALUES.LIGHT]: Sun,
  [APPEARANCE_VALUES.DARK]: Moon
} as const;

/**
 * 获取外观选项配置
 */
export const getAppearanceOptions = (
  resolvedAppearance: AppearanceType,
  systemTheme: 'light' | 'dark',
  t: (key: string) => string
): AppearanceOptions[] => {
  return [
    {
      value: APPEARANCE_VALUES.SYSTEM,
      label: resolvedAppearance === APPEARANCE_VALUES.SYSTEM
        ? systemTheme === 'light'
          ? t('app.theme.system_light')
          : t('app.theme.system_dark')
        : t('app.theme.system'),
      icon: APPEARANCE_ICONS[APPEARANCE_VALUES.SYSTEM],
      description: t('theme.descriptions.system')
    },
    {
      value: APPEARANCE_VALUES.LIGHT,
      label: t('app.theme.light'),
      icon: APPEARANCE_ICONS[APPEARANCE_VALUES.LIGHT],
      description: t('theme.descriptions.light')
    },
    {
      value: APPEARANCE_VALUES.DARK,
      label: t('app.theme.dark'),
      icon: APPEARANCE_ICONS[APPEARANCE_VALUES.DARK],
      description: t('theme.descriptions.dark')
    }
  ];
};

/**
 * 检测系统颜色主题偏好
 */
const detectSystemColorScheme = (): AppearanceType => {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDarkMode ? APPEARANCE_VALUES.DARK : APPEARANCE_VALUES.LIGHT;
};

/**
 * 更新文档根元素主题类
 */
const updateDocumentThemeClasses = (theme: AppearanceType): void => {
  const root = document.documentElement;

  // 移除现有主题类
  root.classList.remove(APPEARANCE_VALUES.LIGHT, APPEARANCE_VALUES.DARK);

  // 添加新主题类
  if (theme === APPEARANCE_VALUES.LIGHT || theme === APPEARANCE_VALUES.DARK) {
    root.classList.add(theme);
  } else {
    // 系统主题：根据系统偏好添加类
    const systemTheme = detectSystemColorScheme();
    root.classList.add(systemTheme);
  }
};

/**
 * 处理系统主题偏好变化
 */
const handleSystemPreferenceChange = (
  event: MediaQueryListEvent,
  setResolvedTheme: (theme: AppearanceType) => void
): void => {
  const newTheme = event.matches ? APPEARANCE_VALUES.DARK : APPEARANCE_VALUES.LIGHT;
  setResolvedTheme(newTheme);
};

/**
 * 根据 document.documentElement.dataset.theme 判断是否是深色模式
 * @returns 'dark' 如果是深色模式，否则返回当前主题值
 */
function getThemeFromDataset(): string | null {
  if (typeof document === 'undefined') return null;

  const datasetTheme = document.documentElement.dataset.theme;
  return datasetTheme || null;
}

/**
 * 自定义外观主题 Hook
 */
export function useAppearance() {
  const { t } = useTranslation();
  const [resolvedTheme, setResolvedTheme] = useState<AppearanceType>('system');
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [storageTheme, setStorageTheme] = usePersistentState<AppearanceType>(APPEARANCE_DEFAULT_STORAGE_KEY, APPEARANCE_VALUES.SYSTEM);
  const { activeColorTheme, setActiveTheme, setActiveColorTheme, activeTheme } = useCustomTheme();
  const { theme, setTheme } = useTheme();
  // 使用 ref 防止重复初始化
  const isInitialized = React.useRef(false);

  // 监听系统主题变化
  useEffect(() => {
    const checkSystemTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSystemTheme(isDark ? 'dark' : 'light');
    };

    checkSystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkSystemTheme);

    return () => mediaQuery.removeEventListener('change', checkSystemTheme);
  }, []);

  /**
   * 选择外观主题
   */
  const selectAppearance = useCallback((appearance: AppearanceType): void => {
    setResolvedTheme(appearance);
    setActiveTheme(appearance);
    setTheme(appearance);
    setStorageTheme(appearance);
  }, [setResolvedTheme, setTheme, setStorageTheme, setActiveTheme]);

  /**
   * 外观选项列表（使用 useMemo 优化性能）
   */
  const appearanceOptions = useMemo(() => {
    return getAppearanceOptions(resolvedTheme, systemTheme, t);
  }, [resolvedTheme, t, systemTheme]);

  /**
   * 获取当前活动的外观选项
   */
  const currentAppearance = useMemo(() => {
    return appearanceOptions.find(option => option.value === activeTheme)
      || appearanceOptions[0];
  }, [activeTheme]);

  /**
   * 初始化主题
   */
  const initializeTheme = useCallback(() => {
    if (!mounted) return;

    const initialTheme = (storageTheme || activeTheme || APPEARANCE_VALUES.SYSTEM) as AppearanceType;
    if (initialTheme !== activeTheme) {
      setActiveTheme(initialTheme);
      setTheme(initialTheme);
      setResolvedTheme(initialTheme);
    }
  }, [mounted, activeTheme, storageTheme, setActiveTheme]);

  /**
   * 组件挂载和主题初始化
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitialized.current) {
      initializeTheme();
      isInitialized.current = true;
    }
  }, [mounted, initializeTheme]);

  // 将 next-themes 的主题值同步到自定义主题上下文，避免两个状态源出现短暂不一致。
  useEffect(() => {
    if (!mounted || !theme) return;

    const normalizedTheme = theme as AppearanceType;
    if (normalizedTheme !== activeTheme) {
      setActiveTheme(normalizedTheme);
    }
  }, [mounted, theme, activeTheme, setActiveTheme]);

  /**
   * 监听系统主题偏好变化（仅当使用系统主题时）
   */
  useEffect(() => {
    if (!mounted || activeTheme !== APPEARANCE_VALUES.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) =>
      handleSystemPreferenceChange(event, setResolvedTheme);

    // 添加监听器
    mediaQuery.addEventListener('change', handleChange);

    // 清理函数
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, activeTheme]);

  /**
   * 监听活动外观变化（外部存储变化）
   */
  // useEffect(() => {
  //   if (!mounted) return;

  //   const currentTheme = activeColorTheme as AppearanceType;
  //   if (currentTheme && currentTheme !== activeAppearance) {
  //     selectColorTheme(currentTheme);
  //   }
  // }, [mounted, activeColorTheme]);

  const currentAppearanceIcon = useMemo(() => {
    if (!mounted) return Monitor;

    if (activeTheme === APPEARANCE_VALUES.SYSTEM) {
      return resolvedTheme === 'light'
        ? Sun
        : Moon;
    }

    return APPEARANCE_ICONS[activeTheme];
  }, [mounted, resolvedTheme, activeTheme]);

  return {
    // 状态
    resolvedTheme,
    activeColorTheme,
    activeTheme,
    mounted,
    systemTheme,

    // 数据
    appearanceOptions,
    currentAppearance,
    currentAppearanceIcon,

    // 方法
    selectAppearance,
    setActiveColorTheme,

    // 工具函数
    isDarkMode: resolvedTheme === APPEARANCE_VALUES.DARK,
    isLightMode: resolvedTheme === APPEARANCE_VALUES.LIGHT,
    isSystemTheme: activeTheme === APPEARANCE_VALUES.SYSTEM,

    // 切换函数
    toggleTheme: () => {
      // 获取当前实际使用的主题（考虑系统主题的情况）
      let currentTheme: AppearanceType;

      if (activeTheme === APPEARANCE_VALUES.SYSTEM) {
        // 如果是系统主题，基于系统偏好判断
        currentTheme = systemTheme === 'dark' ? APPEARANCE_VALUES.DARK : APPEARANCE_VALUES.LIGHT;
      } else {
        currentTheme = activeTheme;
      }

      // 计算新主题
      const newTheme = currentTheme === APPEARANCE_VALUES.LIGHT
        ? APPEARANCE_VALUES.DARK
        : APPEARANCE_VALUES.LIGHT;

      // 选择新主题
      selectAppearance(newTheme);
    },

    // 重置为系统主题
    resetToSystem: () => {
      selectAppearance(APPEARANCE_VALUES.SYSTEM);
    }
  };
}

/**
 * 简化版外观 Hook（仅获取信息，不包含设置功能）
 */
export function useAppearanceInfo() {
  const { resolvedTheme, activeColorTheme: activeAppearance, isDarkMode, isLightMode, isSystemTheme } = useAppearance();

  return {
    resolvedTheme,
    activeAppearance,
    isDarkMode,
    isLightMode,
    isSystemTheme,
    themeLabel: isSystemTheme ? 'System' : (isDarkMode ? 'Dark' : 'Light')
  };
}