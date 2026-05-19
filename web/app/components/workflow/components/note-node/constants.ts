export const THEME_COLORS: Record<string, { bg: string; border: string }> = {
  gold: { bg: 'bg-[var(--sticky-color-bg-variant-1)]', border: 'border-[var(--sticky-color-border-variant-1)]' },
  red: { bg: 'bg-[var(--sticky-color-bg-variant-2)]', border: 'border-[var(--sticky-color-border-variant-2)]' },
  green: { bg: 'bg-[var(--sticky-color-bg-variant-3)]', border: 'border-[var(--sticky-color-border-variant-3)]' },
  blue: { bg: 'bg-[var(--sticky-color-bg-variant-4)]', border: 'border-[var(--sticky-color-border-variant-4)]' },
  purple: { bg: 'bg-[var(--sticky-color-bg-variant-5)]', border: 'border-[var(--sticky-color-border-variant-5)]' },
  neutral: { bg: 'bg-[var(--sticky-color-bg-variant-6)]', border: 'border-[var(--sticky-color-border-variant-6)]' },
}

export type ThemeColorKey = keyof typeof THEME_COLORS;
