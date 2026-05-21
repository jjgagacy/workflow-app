import { cn } from "@/utils/classnames";
import {
  BoldIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNoteEditorStore } from "../store";
import { Tooltip } from "@/app/components/base/tooltip";
import { useCommand } from "../../hooks/use-command";
import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getThemeBgClass, getThemeHoverClass, ThemeType } from "@/types/theme";

type CommandProps = {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'link' | 'bulleted-list';
}

export const Command = ({ type }: CommandProps) => {
  const { t } = useTranslation();
  const selectionBold = useNoteEditorStore(s => s.selectionBold);
  const selectionItalic = useNoteEditorStore(s => s.selectionItalic);
  const selectionUnderline = useNoteEditorStore(s => s.selectionUnderline);
  const selectionStrikethrough = useNoteEditorStore(s => s.selectionStrikethrough);
  const selectionLink = useNoteEditorStore(s => s.selectionLink);
  const selectionBulletedList = useNoteEditorStore(s => s.selectionBulletedList);
  const { handleCommand } = useCommand();
  const { activeColorTheme } = useCustomTheme();

  const isActive = useMemo(() => {
    switch (type) {
      case 'bold':
        return selectionBold;
      case 'italic':
        return selectionItalic;
      case 'underline':
        return selectionUnderline;
      case 'strikethrough':
        return selectionStrikethrough;
      case 'link':
        return selectionLink;
      case 'bulleted-list':
        return selectionBulletedList;
      default:
        return false;
    }
  }, [
    selectionBold,
    selectionBulletedList,
    selectionItalic,
    selectionLink,
    selectionStrikethrough,
    selectionUnderline,
    type,
  ]);

  const icon = useMemo(() => {
    switch (type) {
      case 'bold':
        return <BoldIcon className={cn('h-3 w-3', isActive && 'text-primary')} />;
      case 'italic':
        return <ItalicIcon className={cn('h-3 w-3', isActive && 'text-primary')} />;
      case 'underline':
        return <UnderlineIcon className={cn('h-3 w-3', isActive && 'text-primary')} />;
      case 'strikethrough':
        return <StrikethroughIcon className={cn('h-3 w-3', isActive && 'text-primary')} />;
      case 'link':
        return <Link2Icon className={cn('h-3 w-3', isActive && 'text-primary')} />;
      case 'bulleted-list':
        return <ListIcon className={cn('h-3 w-3', isActive && 'text-primary')} />;
      default:
        return null;
    }
  }, [isActive, type]);

  return (
    <Tooltip
      content={t(`editor.command.${type}`)}
    >
      <button
        type="button"
        aria-label={t(`editor.command.${type}`)}
        aria-pressed={isActive}
        className={cn(
          'flex h-4 w-4 cursor-pointer items-center justify-center',
          `p-0.5 rounded-xs ${getThemeHoverClass(activeColorTheme as ThemeType)}`,
          isActive && getThemeBgClass(activeColorTheme as ThemeType),
        )}
        onClick={() => {
          handleCommand(type);
        }}
      >
        {icon}
      </button>
    </Tooltip>
  );
}