import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import AppIcon from "../../base/app-icon";
import { useTranslation } from "react-i18next";
import AppIconPicker from "../app-icon-picker";
import { AppMode } from "../app.type";
import { SimpleSelect } from "@/app/ui/select";
import { useCreateAppForm } from "../hooks/use-createAppForm";
import { DialogActions, DialogButtonCancel, DialogButtonConfirm } from "@/app/ui/dialog";

interface CreateAppProps {
  onSuccess: (id: string) => void;
  onClose: () => void;
}
export default function CreateApp({
  onClose,
  onSuccess
}: CreateAppProps) {
  const { t } = useTranslation();

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
    onSuccess,
    onClose
  });

  const appModeItems = [
    { value: AppMode.WORKFLOW, name: t('app.types.workflow'), description: t('app.newApp.workflowDescription') },
    { value: AppMode.CHAT, name: t('app.types.chat'), description: t('app.newApp.chatDescription') },
  ];

  return (
    <div className="flex flex-col gap-8 h-full">
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
      <DialogActions>
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
    </div>
  );
}