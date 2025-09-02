'use client';

import Button from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { Separator } from "@/app/ui/separator";
import { ModalProvider, useModalContext } from "@/hooks/use-model";
import { IconPlus } from "@tabler/icons-react";
import RoleListPage from "./role-list";

export function RoleLayout() {
    return (
        <ModalProvider>
            <RolePage />
        </ModalProvider>
    );
}

export function RolePage() {
    const { openModal, resetModalData } = useModalContext();

    const handleAddRole = () => {
        resetModalData();
        openModal('role');
    }

    return (
        <div className="flex flex-1 flex-col space-y-4">
            <div className="flex items-start justify-between">
                <Heading
                    title="角色管理"
                    description="编辑操作角色信息" />
                <Button
                    variant={'primary'}
                    onClick={handleAddRole}
                >
                    <IconPlus className="mr-2 h-4 w-4" /> 添加角色
                </Button>
            </div>
            <Separator />
            <RoleListPage />
        </div>
    );
}
