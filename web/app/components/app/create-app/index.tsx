import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import { useState } from "react";
import AppIcon, { AppIconSource } from "../app-icon";
import { useTranslation } from "react-i18next";

interface CreateAppProps {
  onSuccess: () => void;
  onClose: () => void;
}
export default function CreateApp({
  onClose,
  onSuccess
}: CreateAppProps) {
  const { t } = useTranslation();
  const [appIcon, setAppIcon] = useState<AppIconSource>({ type: 'emoji', icon: '😀' });

  return (
    <div className="flex flex-col gap-8 h-full items-center">
      <div className="w-full">
        <div className="mb-2 flex items-center">
          <Label className="">{t('app.newApp.iconAndName')}</Label>
        </div>
        <div className="flex flex-1 items-center space-x-3">
          <AppIcon
            iconType={appIcon.type}
            icon={appIcon.icon}
            className="mr-1"
            onClick={() => { }}
          />
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