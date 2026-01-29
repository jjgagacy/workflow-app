
export type AppearanceType = 'system' | 'light' | 'dark';

export type AppearanceOptions = {
  value: AppearanceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>,
  description: string;
}
