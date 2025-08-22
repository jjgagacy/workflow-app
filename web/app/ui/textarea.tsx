'use client';

import { cn } from "@/utils/classnames"
import React from "react"

export const Textarea = ({ className, ...props }: React.ComponentProps<'textarea'>) => {
    return (
        <textarea 
            data-slot='textarea'
            className={cn(
                'border-input selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 ring-gray-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className
            )}
            {...props}
        />
    );
}
