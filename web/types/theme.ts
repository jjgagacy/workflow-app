export type ThemeType = 'default' | 'blue' | 'green' | 'amber' | 'default-scaled';

export interface ThemeConfig {
  value: ThemeType;
  name: string;
  activeColor: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
  selectedColor: string;
}

export const themes: ThemeConfig[] = [
  {
    value: 'default',
    name: 'Default',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    textColor: 'text-gray-700 dark:text-gray-200',
    hoverColor: 'hover:bg-gray-100 dark:hover:bg-neutral-700',
    activeColor: 'text-gray-600 dark:text-gray-300',
    selectedColor: 'bg-gray-100 dark:bg-neutral-700',
  },
  {
    value: 'blue',
    name: 'Blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-200',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-800',
    activeColor: 'text-blue-600 dark:text-blue-300',
    selectedColor: 'bg-blue-100 dark:bg-neutral-700',
  },
  {
    value: 'green',
    name: 'Green',
    bgColor: 'bg-green-50 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-200',
    hoverColor: 'hover:bg-green-50 dark:hover:bg-green-800',
    activeColor: 'text-green-600 dark:text-green-300',
    selectedColor: 'bg-green-100 dark:bg-neutral-700',
  },
  {
    value: 'amber',
    name: 'Amber',
    bgColor: 'bg-amber-50 dark:bg-amber-900',
    textColor: 'text-amber-700 dark:text-amber-200',
    hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-800',
    activeColor: 'text-amber-600 dark:text-amber-300',
    selectedColor: 'bg-amber-100 dark:bg-neutral-700',
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

// 获取主题active色
export function getThemeActiveClass(themeValue: ThemeType): string {
  return getThemeConfig(themeValue).activeColor;
}

// 获取主题selected色
export function getThemeSelectedClass(themeValue: ThemeType): string {
  return getThemeConfig(themeValue).selectedColor;
}
