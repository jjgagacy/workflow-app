import { Bookmark, Command, PanelRightClose, Play, Plus, Search } from "lucide-react";
import Button from "../../base/button";
import { Tooltip } from "../../base/tooltip";
import { cn } from "@/utils/classnames";
import { useCustomTheme } from "../../provider/customThemeProvider";
import { getThemeBgClass, getThemeHoverClass, ThemeType } from "@/types/theme";
import { useWorkflowStore } from "../context";
import { ShortcutTooltip } from "../../base/tooltip/shortcut";
import { useTranslation } from "react-i18next";
import { useAddNote } from "../hooks/use-addNote";

export const Control = () => {
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();
  const setShowSidebar = useWorkflowStore(s => s.setShowSidebar);
  const showSidebar = useWorkflowStore(s => s.showSidebar);
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);
  const setShowCommandPalette = useWorkflowStore(s => s.setShowCommandPalette);
  const { addNote } = useAddNote();

  return (
    <div className={cn('flex flex-col items-center rounded-md gap-2 bg-muted/15 p-2')}>
      <ShortcutTooltip label={t('workflow.control.addNode')} shortcut={{ keys: ['N'], metaKey: false }} placement="left">
        <div
          className={cn(`flex h-8 w-8 cursor-pointer items-center border border-[var(--border)] justify-center rounded-sm ${getThemeBgClass(activeColorTheme as ThemeType)} ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors`)}
          onClick={() => {
            setShowNodeSelector(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </div>
      </ShortcutTooltip>
      <ShortcutTooltip label={t('workflow.control.searchCommand')} shortcut={{ keys: ['K'], metaKey: false }} placement="left">
        <div
          className={cn(`flex h-8 w-8 cursor-pointer items-center border border-[var(--border)] justify-center rounded-sm ${getThemeBgClass(activeColorTheme as ThemeType)} ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors`)}
          onClick={() => setShowCommandPalette(true)}
        >
          <Search className="h-4 w-4" />
        </div>
      </ShortcutTooltip>
      <ShortcutTooltip label={t('workflow.control.addNote')} shortcut={{ keys: ['N'], shiftKey: true, metaKey: false }} placement="left">
        <div
          className={cn(`flex h-8 w-8 cursor-pointer items-center border border-[var(--border)] justify-center rounded-sm ${getThemeBgClass(activeColorTheme as ThemeType)} ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors`)}
          onClick={(event) => {
            event.stopPropagation();
            addNote();
          }}
        >
          <Bookmark className="h-4 w-4" />
        </div>
      </ShortcutTooltip>
      <Tooltip content={t('workflow.control.run')} placement="left">
        <div
          className={cn(`flex h-8 w-8 cursor-pointer items-center border border-[var(--border)] justify-center rounded-sm ${getThemeBgClass(activeColorTheme as ThemeType)} ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors`)}
          onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </div>
      </Tooltip>
    </div >
  );
}