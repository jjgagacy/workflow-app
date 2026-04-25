import { Dialog } from "@/app/ui/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CreateApp from "../../app/create-app";

interface CreateAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appId: string) => void;
}

export default function CreateAppDialog({
  isOpen,
  onClose,
  onSuccess
}: CreateAppDialogProps) {
  const { t } = useTranslation();

  const handleSuccess = (appId: string) => {
    if (onSuccess) {
      onSuccess(appId);
    }
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        title={t('app.newApp.title')}
        description=""
        className="max-w-3xl! min-h-3/4"
        actions={false}
        onCancel={() => onClose()}
      >
        <h1 className="text-lg font-semibold mt-3 mb-5">{t('app.newApp.appDetails')}</h1>
        <div className="flex flex-1 items-center">
          <div className="px-0 w-full">
            <CreateApp
              onClose={() => onClose()}
              onSuccess={(appId) => handleSuccess(appId)}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}