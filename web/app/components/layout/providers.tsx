'use client';

import { ReactNode } from 'react';
import { ActiveThemeProvider } from '../active-theme';
import { Toasters } from './toasters';
import { DialogProvider } from '../hooks/use-dialog';

export default function Providers({
  children, activeThemeValue
}: { children: ReactNode, activeThemeValue: string }) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <DialogProvider>
          <Toasters />
          {children}
        </DialogProvider>
      </ActiveThemeProvider>
    </>
  );
}