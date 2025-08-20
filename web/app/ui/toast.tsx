'use client';

import { ExternalToast, toast as sonnerToast } from "sonner"

const TOAST_POSITION = 'top-center';
const TOAST_RICH_COLORS = true;

const toastDefaultOptions = {
    position: TOAST_POSITION,
    richColors: TOAST_RICH_COLORS
}

function message(message: string, description?: string) {
    sonnerToast.message(message, {
        description,
        ... toastDefaultOptions
    } as ExternalToast);
}

function info(message: string) {
    sonnerToast.info(message, { position: TOAST_POSITION});
}

function success(message: string) {
    sonnerToast.success(message, { ...toastDefaultOptions } as ExternalToast);
}

function error(message: string) {
    sonnerToast.error(message, { ...toastDefaultOptions } as ExternalToast);
}

function warning(message: string) {
    sonnerToast.warning(message, { ...toastDefaultOptions } as ExternalToast);
}

function promise<T>(promiseValue: Promise<T>) {
    sonnerToast.promise(promiseValue, {
        loading: 'Loading..',
        success: (data: T) => {
            return `toast has been added`;
        },
        error: 'Error',
        ...toastDefaultOptions
    } as ExternalToast)
}

function loading(message: string = 'Loading...') {
    return sonnerToast.loading(message, { ...toastDefaultOptions } as ExternalToast);
}

function dismiss() {
    sonnerToast.dismiss();
}

export const toast = {
    message,
    info,
    success,
    warning,
    error,
    promise,
    loading,
    dismiss
}
