import { KeyboardShortcut } from "@/app/components/base/tooltip/shortcut";
import { ContextMenuActionWrapper } from "./wrapper";
import { KeyboardShortcutDisplay } from "@/app/components/base/tooltip/keyboard";
import { cn } from "@/utils/classnames";

interface ContextMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  shortcut?: KeyboardShortcut;
  disabled?: boolean;
}

export const ContextMenuItem = ({ label, icon, onClick, shortcut, disabled = false }: ContextMenuItemProps) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };
  return (
    <ContextMenuActionWrapper onClick={handleClick} className={cn(disabled && 'cursor-not-allowed opacity-50')}>
      <span className="flex items-center gap-2">
        {icon && (
          <span className={cn(
            "flex-shrink-0 w-[15px] h-[15px] flex items-center justify-center",
            disabled && "text-text-disabled"
          )}>
            {icon}
          </span>
        )}
        <span className={cn("text-sm text-text-secondary", disabled && "text-text-disabled")}>{label}</span>
      </span>
      {shortcut && (
        <KeyboardShortcutDisplay shortcut={shortcut} />
      )}
    </ContextMenuActionWrapper>
  )
}