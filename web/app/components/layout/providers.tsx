'use client';

import { ReactNode } from 'react';
import { ActiveThemeProvider } from '../active-theme';
import { Toasters } from './toasters';

export default function Providers({
    children, activeThemeValue
}: { children: ReactNode, activeThemeValue: string}) {
    return (
        <>
            <ActiveThemeProvider initialTheme={activeThemeValue}>
                <Toasters />
                {children}
            </ActiveThemeProvider>
        </>
    );
}