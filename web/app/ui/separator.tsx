'use client';

import { cn } from "@/utils/classnames";
import * as React from "react"

type SeparatorProps = React.ComponentProps<'hr'> &
    { orientation?: string };

export const Separator = ({ className, orientation = 'horizontal', ...props }: SeparatorProps) => {
    return (
        <hr
            className={cn(
                'bg-border border-[var(--border)] shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
                className
            )}
            {...props}
         />
    );
}