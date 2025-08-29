'use client';

import Button from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { Separator } from "@/app/ui/separator";
import { ModalProvider, useModalContext } from "@/hooks/use-model";
import { IconPlus } from "@tabler/icons-react";
import ModuleListPage from "./module-list";

export function ModuleLayout() {
    return (
        <ModalProvider>
            <ModulePage />
        </ModalProvider>
    );
}

export function ModulePage() {
    const {openModal} = useModalContext();
    
    return (
        <div className="flex flex-1 flex-col space-y-4">
            <div className="flex items-start justify-between">
                <Heading
                    title="权限组管理"
                    description="编辑操作权限信息" />
                <Button
                    variant={'primary'}
                    onClick={() => openModal()}
                >
                    <IconPlus className="mr-2 h-4 w-4" /> 添加权限组
                </Button>
            </div>
            <Separator />
            <ModuleListPage />
        </div>
    );
}