import { AppearanceType } from '@/types/appearance';

const STORAGE_KEY = 'appearance-theme';

class ThemeStorageService {
  private listeners: Set<(theme: AppearanceType) => void> = new Set();
  private currentTheme: AppearanceType | null = null;

  constructor() {
    // 监听跨标签页的 storage 事件
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      // 初始化当前主题
      this.currentTheme = this.getSavedTheme();
    }
  }

  /**
   * 保存主题到 localStorage
   */
  saveTheme(theme: AppearanceType): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      this.currentTheme = theme;
      // 触发同标签页的监听器
      this.notifyListeners(theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * 从 localStorage 获取保存的主题
   */
  getSavedTheme(): AppearanceType | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppearanceType;
      if (saved && ['system', 'light', 'dark'].includes(saved)) {
        return saved;
      }
    } catch (error) {
      console.error('Failed to read theme from localStorage:', error);
    }
    return null;
  }

  /**
   * 移除保存的主题（恢复默认）
   */
  removeSavedTheme(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.currentTheme = null;
    } catch (error) {
      console.error('Failed to remove theme from localStorage:', error);
    }
  }

  /**
   * 监听跨标签页的 storage 事件
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === STORAGE_KEY && event.newValue) {
      const newTheme = event.newValue as AppearanceType;
      if (['system', 'light', 'dark'].includes(newTheme)) {
        this.currentTheme = newTheme;
        this.notifyListeners(newTheme);
      }
    }
  }

  /**
   * 通知所有监听器主题变化
   */
  private notifyListeners(theme: AppearanceType): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme listener:', error);
      }
    });
  }

  /**
   * 订阅主题变化
   * @returns 取消订阅函数
   */
  subscribe(listener: (theme: AppearanceType) => void): () => void {
    this.listeners.add(listener);
    // 立即返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 获取当前主题（优先返回保存的主题）
   */
  getCurrentTheme(): AppearanceType | null {
    return this.currentTheme ?? this.getSavedTheme();
  }

  /**
   * 清理所有监听器
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
    this.listeners.clear();
  }
}

// 导出单例实例
export const themeStorage = new ThemeStorageService();