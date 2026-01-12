export type ThemeType = 'blue' | 'green' | 'amber';

export interface ThemeConfig {
  value: ThemeType;
  name: string;
  activeColor: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
}

export const themes: ThemeConfig[] = [
  {
    value: 'blue',
    name: 'Blue',
    activeColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    hoverColor: 'hover:bg-blue-100',
  },
  {
    value: 'green',
    name: 'Green',
    activeColor: 'text-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    hoverColor: 'hover:bg-green-100',
  },
  {
    value: 'amber',
    name: 'Amber',
    activeColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    hoverColor: 'hover:bg-amber-100',
  },
];

// 获取单个主题配置
export function getThemeConfig(themeType: ThemeType): ThemeConfig {
  const theme = themes.find(t => t.value === themeType);
  return theme || themes[0];
}

// 获取激活状态的样式
export function getActiveThemeClass(activeTheme: ThemeType, currentTheme: ThemeType): string {
  if (activeTheme === currentTheme) {
    return getThemeConfig(activeTheme).activeColor;
  }
  return 'text-gray-700 dark:text-gray-300';
}

// 获取主题背景色
export function getThemeBgClass(themeValue: ThemeType): string {
  return getThemeConfig(themeValue).bgColor;
}

// 获取主题文字色
export function getThemeTextClass(themeValue: ThemeType): string {
  return getThemeConfig(themeValue).textColor;
}

// 获取主题hover色
export function getThemeHoverClass(themeValue: ThemeType): string {
  return getThemeConfig(themeValue).hoverColor;
}