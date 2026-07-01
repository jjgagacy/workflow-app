'use client';

import { useAppearance } from "@/hooks/use-appearance";
import { SunMoon } from "lucide-react";

export function ThemeToggleButton() {
  const { toggleTheme } = useAppearance();

  return (
    <button
      type="button"
      className="mx-2 rounded-full p-1 text-text-primary focus:outline-none"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <SunMoon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
