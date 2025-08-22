'use client';

import { cn } from "@/utils/classnames"
import * as React from "react"
import { Switch as HeadlessSwitch } from '@headlessui/react'
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";

type SwitchProps = {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    className?: string;
}

export const Switch: FC<SwitchProps> = ({ checked, onChange, className }) => {
    const [enabled, setEnabled] = useState(checked || false);

    return (
        <HeadlessSwitch
            checked={enabled}
            onChange={() => { setEnabled(!enabled); onChange && onChange(!enabled); }}
            className={cn(
                "group relative flex h-5 w-10 cursor-pointer rounded-full bg-primary/10 p-1 ease-in-out focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white",
                'shrink-0 border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[checked]:bg-primary data-[unchecked]:bg-secondary',
                ' border-[var(--border)]',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 flex items-center',
                className
            )}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none inline-block size-3 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-4"
            />
        </HeadlessSwitch>
    );
}

