import { Dialog } from "@/app/ui/dialog";
import { useTranslation } from "react-i18next";
import CreateApp from "../../app/create-app";
import { AppIconType } from "../../app/constants/appModes";
import { CreateAppData } from "../../app/hooks/use-createAppForm";
import { usePlatformShortcut } from "../../workflow/hooks/use-platformShortcut";

interface CreateAppDialogProps {
  isOpen: boolean;
  isEdit?: boolean;
  name: string;
  description?: string;
  iconType: AppIconType | null;
  icon: string;
  mode?: string;
  onClose: () => void;
  onSuccess?: () => void;
  onConfirm: (data: CreateAppData) => void;
}

export default function CreateAppDialog({
  isOpen,
  isEdit,
  name,
  description,
  iconType,
  icon,
  mode,
  onClose,
  onSuccess,
  onConfirm
}: CreateAppDialogProps) {
  const { t } = useTranslation();

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  usePlatformShortcut('esc', () => {
    console.log('aa');
    if (isOpen) {
      onClose();
    }
  }, { metaKey: false });

  return (
    <>
      <Dialog
        isOpen={isOpen}
        title={isEdit ? t('app.newApp.editAppTitle') : t('app.newApp.title')}
        description=""
        className="max-w-2xl! max-h-[90dvh]!"
        actions={false}
        onCancel={() => onClose()}
      >
        <h1 className="text-lg font-semibold mt-3 mb-5">{isEdit ? t('app.newApp.editAppDetails') : t('app.newApp.appDetails')}</h1>
        <div className="flex flex-1 items-center">
          <div className="px-0 w-full">
            <CreateApp
              isEdit={isEdit}
              name={name}
              description={description}
              iconType={iconType}
              icon={icon}
              mode={mode}
              onClose={() => onClose()}
              onSuccess={() => handleSuccess()}
              onConfirm={onConfirm}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}