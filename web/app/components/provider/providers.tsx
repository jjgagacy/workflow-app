'use client';

import { ReactNode } from 'react';
import { CustomThemeProvider } from './customThemeProvider';
import { Toasters } from '../layout/toasters';
import { DialogProvider } from '../hooks/use-dialog';

export default function Providers({
  children,
  activeThemeValue,
  activeColorThemeValue
}: { children: ReactNode, activeThemeValue: string, activeColorThemeValue: string }) {
  return (
    <>
      <CustomThemeProvider initialTheme={activeThemeValue} initialColorTheme={activeColorThemeValue}>
        <DialogProvider>
          <Toasters />
          {children}
        </DialogProvider>
      </CustomThemeProvider>
    </>
  );
}