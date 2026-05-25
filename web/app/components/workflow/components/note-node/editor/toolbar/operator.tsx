import Popover from "@/app/components/base/popover";
import { KeyboardShortcutDisplay } from "@/app/components/base/tooltip/keyboard";
import { KeyboardShortcut } from "@/app/components/base/tooltip/shortcut";
import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { cn } from "@/utils/classnames";
import { Copy, CopyPlus, Ellipsis, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type OperatorProps = {
  onCopy: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

type OperatorItem = {
  key: 'copy' | 'duplicate' | 'delete';
  label: string;
  icon: React.ReactNode;
  shortcut: KeyboardShortcut;
  danger?: boolean;
  onClick: () => void;
}

export const Operator = ({ onCopy, onDuplicate, onDelete }: OperatorProps) => {
  const { activeColorTheme } = useCustomTheme();
  const { t } = useTranslation();
  const items: OperatorItem[] = [
    {
      key: 'copy',
      label: t('workflow.control.copy'),
      icon: <Copy className="h-3.5 w-3.5" />,
      shortcut: { keys: ['c'], metaKey: true },
      onClick: onCopy,
    },
    {
      key: 'duplicate',
      label: t('workflow.control.duplicate'),
      icon: <CopyPlus className="h-3.5 w-3.5" />,
      shortcut: { keys: ['d'], metaKey: true },
      onClick: onDuplicate,
    },
    {
      key: 'delete',
      label: t('workflow.control.delete'),
      icon: <Trash2 className="h-3.5 w-3.5" />,
      shortcut: { keys: ['delete'] },
      danger: true,
      onClick: onDelete,
    },
  ];

  return (
    <Popover
      trigger={<Ellipsis className="h-4 w-4 cursor-pointer" />}
      direction="bottom"
      gap={6}
      offset={5}
      padding={0}
      triggerClassName="rounded-xs p-0.5 hover:bg-state-base-hover"
      panelClassName="min-w-[180px] rounded-md bg-background shadow-md"
      sameWidth={false}
      disabled={false}
      portal={true}
    >
      {({ close }) => (
        <div className="flex flex-col p-1">
          {items.map((item, index) => (
            <div key={item.key}>
              {item.key === 'delete' && (
                <div className="mx-1 my-1 h-px bg-[var(--border)]" />
              )}
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                  item.danger
                    ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                    : `text-text-secondary ${getThemeHoverClass(activeColorTheme as ThemeType)}`,
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  item.onClick();
                  close();
                }}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                <KeyboardShortcutDisplay shortcut={item.shortcut} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Popover>
  );
};

export default Operator;