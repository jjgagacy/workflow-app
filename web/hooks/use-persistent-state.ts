import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 安全地从 localStorage 读取值
  const readStoredValue = (): T => {
    // 确保在服务端渲染时不执行
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 初始化状态
  const [state, setState] = useState<T>(readStoredValue);

  // 持久化状态到 localStorage 的包装函数
  const setPersistedState = (value: T) => {
    try {
      // 允许值是一个函数，类似于 useState 的更新函数
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      
      // 保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听 localStorage 变化以同步不同标签页的状态
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setState(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing new value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  // 组件挂载时检查 localStorage 是否有更新
  useEffect(() => {
    const currentStoredValue = readStoredValue();
    if (currentStoredValue !== state) {
      setState(currentStoredValue);
    }
  }, [key]);

  return [state, setPersistedState];
}