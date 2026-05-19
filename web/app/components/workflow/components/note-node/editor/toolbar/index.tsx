import { Divider } from "@/app/components/base/divider";
import { useTranslation } from "react-i18next";
import { NoteNodeTheme } from "../../types";
import { ColorPicker } from "./color-picker";

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
      <Divider type={'vertical'} className="h-3.5" />
      <p className="pl-2">bb123</p>
    </div>
  );
}