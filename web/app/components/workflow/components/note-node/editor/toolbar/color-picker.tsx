import Popover from "@/app/components/base/popover";
import { NoteNodeTheme } from "../../types";
import { Button } from "@/app/components/base/button";
import { Palette } from "lucide-react";
import { THEME_COLORS, ThemeColorKey } from "../../constants";
import { cn } from "@/utils/classnames";

export type ColorPickerProps = {
  theme: NoteNodeTheme;
  onThemeChange: (theme: NoteNodeTheme) => void;
}

export const ColorPicker = ({ theme, onThemeChange }: ColorPickerProps) => {
  return (
    <Popover
      trigger={<Palette size={14} className="cursor-pointer mr-2" />}
      direction="top"
      gap={4}
      offset={0}
      padding={8}
      triggerClassName=""
      panelClassName="bg-background rounded-md shadow-md w-[180px]"
      sameWidth={false}
      disabled={false}
      portal={true}
    >
      {({ close }) => (
        <div className="flex flex-row gap-2 w-fit p-2">
          {(Object.keys(THEME_COLORS) as ThemeColorKey[]).map((colorKey) => (
            <div
              key={colorKey}
              className={cn(
                'w-6 h-6 rounded cursor-pointer ring-black/20',
                THEME_COLORS[colorKey].bg,
                THEME_COLORS[colorKey].border,
                theme === colorKey ? 'ring-2 ring-offset-1 shadow-sm' : 'ring-1 opacity-70'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onThemeChange(colorKey as NoteNodeTheme);
                close();
              }}
            >
            </div>
          ))}
        </div>
      )}
    </Popover>
  );
}