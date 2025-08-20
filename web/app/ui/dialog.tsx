'use client';

import { ReactNode } from "react";
import { Dialog as HeadlessDialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import Loading from "../components/base/loading";

interface DialogProps {
    isOpen: boolean;
    title: string;
    description?: string;
    children?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
    className?: string;
    isLoading?: boolean;
}

export function Dialog(props: DialogProps) {
    const {
        isOpen,
        title,
        description,
        children,
        confirmText = "确定",
        cancelText = "取消",
        onConfirm,
        onCancel,
        destructive = false,
        className = "",
        isLoading = false
    } = props;

    return (
        <HeadlessDialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
            <DialogPanel className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50 z-60"></div>
                <div className="fixed inset-0 z-70 flex items-center justify-center">
                    <div className={`bg-background rounded-lg border px-2 w-full max-w-md shadow-lg outline-none ${className}`}>
                        <DialogTitle>
                            <div className="flex justify-between items-center border-b px-6 py-4">
                                <h3 className="text-lg font-medium">
                                    {title}
                                </h3>
                                <button
                                    onClick={onCancel}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    &times;
                                </button>
                            </div>
                        </DialogTitle>
                        {description && (
                            <Description>This will permanently deactivate your account</Description>
                        )}

                        {children && (
                            <div className="mt-4 px-6 py-4">
                                {children}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-4 px-6 py-4">
                            <button
                                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                onClick={onCancel}
                            >
                                {cancelText}
                            </button>
                            <button
                                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${destructive
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={onConfirm}
                                disabled={isLoading}
                            >
                                <span className="flex items-center justify-center">
                                    {isLoading && <Loading />}
                                    {confirmText}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </DialogPanel>
        </HeadlessDialog>
    );
}