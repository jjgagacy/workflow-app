'use client';

import { ReactNode } from 'react';
import { ActiveThemeProvider } from '../active-theme';

export default function Providers({
    children, activeThemeValue
}: { children: ReactNode, activeThemeValue: string}) {
    return (
        <>
            <ActiveThemeProvider initialTheme={activeThemeValue}>
                {children}
            </ActiveThemeProvider>
        </>
    );
}