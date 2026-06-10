import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import AppIcon, { AppIconSource } from "../../base/app-icon";
import { useTranslation } from "react-i18next";
import AppIconPicker from "../app-icon-picker";
import { AppIconType, AppMode } from '../constants/appModes';
import { SimpleSelect } from "@/app/ui/select";
import { CreateAppData, useCreateAppForm } from "../hooks/use-createAppForm";
import { DialogActions, DialogButtonCancel, DialogButtonConfirm } from "@/app/ui/dialog";
import { useAppModes } from "../hooks/use-appModes";

interface CreateAppProps {
  onConfirm: (data: CreateAppData) => void;
  onSuccess: () => void;
  onClose: () => void;
  isEdit?: boolean;
  name?: string;
  description?: string;
  iconType?: AppIconType | null;
  icon?: string;
  mode?: string;
}

export default function CreateApp({
  onClose,
  onSuccess,
  isEdit,
  name,
  description,
  iconType,
  icon,
  mode,
  onConfirm
}: CreateAppProps) {
  const { t } = useTranslation();
  const { appModeItems } = useAppModes();

  const {
    formData,
    showIconPicker,
    setShowIconPicker,
    iconSource,
    iconPickerRef,
    handleIconSelect,
    isCreating,
    createApp: handleCreate,
    isValid,
    setName,
    setMode,
    setDescription
  } = useCreateAppForm({
    name,
    description,
    icon,
    iconType: iconType as AppIconSource['type'] || undefined,
    mode: mode as AppMode || undefined,
    onSuccess,
    onClose,
    onConfirm
  });

  return (
    <div className="h-full">
      <div className="px-4 flex flex-col gap-8">
        <fieldset>
          <div className="mb-2 flex items-center">
            <Label>{t('app.newApp.iconAndName')}</Label>
          </div>
          <div className="flex flex-1 items-center space-x-3">
            <div className="relative">
              <AppIcon
                iconType={iconSource.type}
                icon={iconSource.icon}
                className="mr-1"
                onClick={() => setShowIconPicker(!showIconPicker)}
              />
              {showIconPicker && (
                <AppIconPicker
                  containerRef={iconPickerRef}
                  onSelect={handleIconSelect}
                  onClose={() => setShowIconPicker(false)}
                />
              )}
            </div>
            <div className="flex-1">
              <Input className="w-full" value={formData.name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <div className="mb-2 flex items-center">
            <Label>{t('app.newApp.description')}</Label>
          </div>
          <div className="flex flex-1 items-center space-x-3">
            <Input className="w-full" value={formData.description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </fieldset>
        {!isEdit && (
          <fieldset>
            <div className="mb-2 flex items-center">
              <Label>{t('app.appType')}</Label>
            </div>
            <div className="flex flex-1 items-center space-x-3">
              <SimpleSelect
                items={appModeItems}
                placeholder={t('app.newApp.select')}
                defaultValue={formData.mode || ""}
                className="w-full"
                onSelect={(item) => setMode(item.value as AppMode)}
              />
            </div>
          </fieldset>
        )}
      </div>
      <DialogActions className="mt-8">
        <DialogButtonCancel
          onCancel={onClose}
          cancelText={t('system.cancel')}
        />
        <DialogButtonConfirm
          onConfirm={handleCreate}
          confirmText={t('system.confirm')}
          isLoading={isCreating}
          disabled={!isValid}
        />
      </DialogActions>
    </div >
  );
}