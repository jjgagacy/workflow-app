import { Divider } from "@/app/components/base/divider";
import { useTranslation } from "react-i18next";
import { NoteNodeTheme } from "../../types";
import { ColorPicker } from "./color-picker";
import { FontSizeSelector } from "./font-size-selector";
import { Command } from "./command";

type ToolbarProps = {
  theme: NoteNodeTheme;
  onCopy: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onThemeChange: (theme: NoteNodeTheme) => void;
}

export const Toolbar = ({ theme, onCopy, onDelete, onDuplicate, onThemeChange }: ToolbarProps) => {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center p-1">
      <ColorPicker
        theme={theme}
        onThemeChange={onThemeChange}
      />
      <Divider type={'vertical'} className="h-3.5 mx-1" />
      <FontSizeSelector />
      <Divider type={'vertical'} className="h-3.5 mx-1" />
      <div className='flex items-center space-x-2'>
        <Command type="bold" />
        <Command type="italic" />
        <Command type="underline" />
        <Command type="strikethrough" />
        <Command type="link" />
        <Command type="bulleted-list" />
      </div>
      <Divider type={'vertical'} className="h-3.5 mx-1" />
    </div>
  );
}