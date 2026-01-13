'use client';

import Button from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { Separator } from "@/app/ui/separator";
import { ModalProvider, useModalContext } from "@/hooks/use-model";
import { IconPlus } from "@tabler/icons-react";
import ModuleListPage from "./module-list";
import { useTranslation } from "react-i18next";

export function ModuleLayout() {
  return (
    <ModalProvider>
      <ModulePage />
    </ModalProvider>
  );
}

export function ModulePage() {
  const { openModal, resetModalData } = useModalContext();
  const { t } = useTranslation();

  const handleAddModule = () => {
    resetModalData();
    openModal('module');
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Heading
          title={t('system.permission_group_management')}
          description={t('system.edit_operation_permission_info')} />
        <Button
          variant={'primary'}
          onClick={handleAddModule}
        >
          <IconPlus className="mr-2 h-4 w-4" /> {t('system.add_permission_group')}
        </Button>
      </div>
      <Separator />
      <ModuleListPage />
    </div>
  );
}