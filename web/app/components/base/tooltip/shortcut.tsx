import { Tooltip } from ".";
import { KeyboardShortcutDisplay } from "./keyboard";

export interface KeyboardShortcut {
  keys: string[];
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

interface ShortcutTooltipProps {
  children: React.ReactNode;
  label: string;
  shortcut: KeyboardShortcut;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  showDelay?: number;
  className?: string;
  shortcutClassName?: string;
}


export const ShortcutTooltip = ({
  children,
  label,
  shortcut,
  placement = 'top',
  disabled = false,
  showDelay = 500,
  className,
  shortcutClassName,
}: ShortcutTooltipProps) => {
  const content = (
    <div className="flex items-center gap-2 text-xs">
      <span className="shrink-0">{label}</span>
      {shortcut && <KeyboardShortcutDisplay shortcut={shortcut} className={shortcutClassName} />}
    </div>
  );

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip content={content} placement={placement} className={className}>
      {children}
    </Tooltip>
  );
};