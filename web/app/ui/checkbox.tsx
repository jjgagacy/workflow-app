'use client';

import { cn } from "@/utils/classnames"
import * as React from "react"

export const Checkbox = ({ className, ...props }: React.ComponentProps<'input'>) => {
    return (
        <input
            type="checkbox"
            data-slot='checkbox'
            className={cn(
                'border border-[var(--border)] bg-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-sm shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                'appearance-none accent-primary checked:appearance-auto dark:accent-primary',
                className
            )}
            {...props}
        />
    );
}

