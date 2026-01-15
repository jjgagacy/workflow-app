'use client';

import { ReactNode } from "react";
import { Dialog as HeadlessDialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import Button from "../components/base/button";
import Spinner from "../components/base/spinner";

interface DialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string | null;
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
    confirmText = "Confirm",
    cancelText = "Cancel",
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
          <div className={`bg-background rounded-lg px-2 w-full max-w-md shadow-lg outline-none ${className}`}>
            <DialogTitle>
              <div className={`flex justify-between items-center ${description && 'border-b border-[var(--border)]'}  px-4 py-4`}>
                <h3 className="text-lg font-medium">
                  {title}
                </h3>
                <button
                  onClick={onCancel}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 text-xl"
                >
                  &times;
                </button>
              </div>
            </DialogTitle>

            {description && (
              <Description className='py-4 px-4'>{description}</Description>
            )}

            {children && (
              <div className="px-4 py-4">
                {children}
              </div>
            )}
            <div className="flex justify-end gap-4 px-6 py-4">
              {cancelText && (<Button
                variant={'secondary'}
                className="inline-flex items-center justify-center"
                onClick={onCancel}
              >
                {cancelText}
              </Button>)}
              <Button
                variant={`${destructive ? 'warning' : 'primary'}`}
                className={`inline-flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onConfirm}
                disabled={isLoading}
              >
                <span className="flex items-center justify-center gap-1">
                  {confirmText}
                  {isLoading && <Spinner />}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogPanel>
    </HeadlessDialog>
  );
}
