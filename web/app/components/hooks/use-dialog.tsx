'use client';

import { Dialog } from "@/app/ui/dialog";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

interface DialogOptions {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string | null;
    destructive?: boolean;
    className?: string;
    onConfirm?: () => Promise<void> | void;
    onCancel?: () => void;
    children?: ReactNode;
}

interface DialogContextType {
    showDialog: (opts: DialogOptions) => Promise<boolean>;
    showAlert: (title: string, message?: string) => Promise<void>;
    showConfirm: (title: string, message?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<DialogOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
    const { t } = useTranslation();

    const showDialog = useCallback((opts: DialogOptions): Promise<boolean> => {
        return new Promise(resolve => {
            setOptions(opts);
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    }, [setOptions, setResolvePromise, setIsOpen]);

    const handleConfirm = async () => {
        if (options?.onConfirm) {
            await options.onConfirm();
        }
        if (resolvePromise) {
            resolvePromise(true);
        }
        setIsOpen(false);
    }

    const handleCancel = () => {
        if (options?.onCancel) {
            options.onCancel();
        }
        if (resolvePromise) {
            resolvePromise(false);
        }
        setIsOpen(false);
    }

    const showAlert = useCallback(async (title: string, message?: string): Promise<void> => {
        await showDialog({
            title,
            description: message,
            confirmText: t('app.actions.confirm'),
            cancelText: null,
            onConfirm: () => { },
            className: '!w-[260px]'
        });
    }, [showDialog]);

    const showConfirm = useCallback(async (title: string, message?: string): Promise<boolean> => {
        return await showDialog({
            title,
            description: message,
            confirmText: t('app.actions.confirm'),
            cancelText: t('app.actions.cancel')
        });
    }, [showDialog]);

    const store: DialogContextType = {
        showDialog,
        showAlert,
        showConfirm
    };

    return (
        <DialogContext.Provider value={store}>
            {children}
            {options && (
                <Dialog
                    isOpen={isOpen}
                    title={options.title}
                    description={options.description}
                    confirmText={options.confirmText}
                    cancelText={options.cancelText}
                    destructive={options.destructive}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    className={options.className}
                >{options.children}</Dialog>
            )}
        </DialogContext.Provider>
    );
}

export const useDialog = (): DialogContextType => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
}
