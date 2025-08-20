'use client';

import { useTheme } from "next-themes";
import React from "react";
import { ToasterProps, Toaster } from "sonner";

const Toasters = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Toaster
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)'
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toasters }
