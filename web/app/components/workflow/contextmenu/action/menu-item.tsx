import { KeyboardShortcut } from "@/app/components/base/tooltip/shortcut";
import { ContextMenuActionWrapper } from "./wrapper";
import { KeyboardShortcutDisplay } from "@/app/components/base/tooltip/keyboard";

interface ContextMenuItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  shortcut?: KeyboardShortcut;
}

export const ContextMenuItem = ({ label, icon, onClick, shortcut }: ContextMenuItemProps) => {
  return (
    <ContextMenuActionWrapper onClick={onClick}>
      <span className="flex items-center gap-2">
        {icon && (
          <span className="text-text-secondary flex-shrink-0 w-[15px] h-[15px] flex items-center justify-center">
            {icon}
          </span>
        )}
        <span className="text-sm text-text-secondary">{label}</span>
      </span>
      {shortcut && (
        <KeyboardShortcutDisplay shortcut={shortcut} />
      )}
    </ContextMenuActionWrapper>
  )
}