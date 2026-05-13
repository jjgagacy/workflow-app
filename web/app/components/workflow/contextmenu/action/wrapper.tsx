import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getThemeHoverClass, ThemeType } from "@/types/theme";

interface ContextMenuActionWrapperProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const ContextMenuActionWrapper = ({ children, onClick }: ContextMenuActionWrapperProps) => {
  const { activeColorTheme } = useCustomTheme();
  return (
    <div
      className={`w-full flex cursor-pointer items-center justify-between rounded-md px-3 py-1.5 text-sm text-text-secondary ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </div>
  );
}
