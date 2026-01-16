'use client';

import Button from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { Separator } from "@/app/ui/separator";
import { ModalProvider, useModalContext } from "@/hooks/use-modal";
import { IconPlus } from "@tabler/icons-react";
import RoleListPage from "./role-list";
import { useTranslation } from "react-i18next";

export function RoleLayout() {
  return (
    <ModalProvider>
      <RolePage />
    </ModalProvider>
  );
}

export function RolePage() {
  const { openModal, resetModalData } = useModalContext();
  const { t } = useTranslation();

  const handleAddRole = () => {
    resetModalData();
    openModal('role');
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Heading
          title={t('system.role_management')}
          description={t('system.edit_operation_role_info')} />
        <Button
          variant={'primary'}
          onClick={handleAddRole}
        >
          <IconPlus className="mr-2 h-4 w-4" /> {t('system.add_role')}
        </Button>
      </div>
      <Separator />
      <RoleListPage />
    </div>
  );
}
