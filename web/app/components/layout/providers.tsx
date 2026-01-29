'use client';

import { ReactNode } from 'react';
import { AppearanceProvider } from '../appearance';
import { Toasters } from './toasters';
import { DialogProvider } from '../hooks/use-dialog';

export default function Providers({
  children, activeThemeValue
}: { children: ReactNode, activeThemeValue: string }) {
  return (
    <>
      <AppearanceProvider initial={activeThemeValue}>
        <DialogProvider>
          <Toasters />
          {children}
        </DialogProvider>
      </AppearanceProvider>
    </>
  );
}