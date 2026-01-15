import { Theme } from '@/types/app';
import { useTheme as useNextTheme } from 'next-themes'

const useTheme = () => {
  const { theme, resolvedTheme, ...rest } = useNextTheme();
  return {
    // only returns light or dark
    theme: theme === Theme.dark ? resolvedTheme as Theme : theme as Theme,
    ...rest,
  }
}

export default useTheme;
