import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import { useEffect, useRef, useState } from "react";
import AppIcon, { AppIconSource } from "../../base/app-icon";
import { useTranslation } from "react-i18next";
import AppIconPicker from "../app-icon-picker";
import { defaultIconSet } from "../../base/app-icon/icons";

interface CreateAppProps {
  onSuccess: () => void;
  onClose: () => void;
}
export default function CreateApp({
  onClose,
  onSuccess
}: CreateAppProps) {
  const { t } = useTranslation();
  const [appIcon, setAppIcon] = useState<AppIconSource>({ type: 'icon', icon: defaultIconSet });
  const [showAppIconPicker, setShowAppIconPicker] = useState(false);
  const appIconPickerRef = useRef<HTMLDivElement>(null);

  const handleIconSelect = (icon: AppIconSource) => {
    setAppIcon(icon);
    setShowAppIconPicker(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (appIconPickerRef.current && !appIconPickerRef.current.contains(event.target as Node)) {
        setShowAppIconPicker(false);
      }
    };

    if (showAppIconPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAppIconPicker]);

  return (
    <div className="flex flex-col gap-8 h-full items-center">
      <div className="w-full">
        <div className="mb-2 flex items-center">
          <Label className="">{t('app.newApp.iconAndName')}</Label>
        </div>
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative">
            <AppIcon
              iconType={appIcon.type}
              icon={appIcon.icon}
              className="mr-1"
              onClick={() => setShowAppIconPicker(!showAppIconPicker)}
            />
            {showAppIconPicker && (
              <AppIconPicker
                containerRef={appIconPickerRef}
                onSelect={handleIconSelect}
                onClose={() => setShowAppIconPicker(false)}
              />
            )}
          </div>
          <div className="flex-1">
            <Input className="w-full" />
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="mb-2 flex items-center">
          <Label className="">{t('app.newApp.description')}</Label>
        </div>
        <div className="flex flex-1 items-center space-x-3">
          <Input className="w-full" />
        </div>
      </div>
    </div>
  );
}