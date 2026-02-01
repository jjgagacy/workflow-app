'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Monie } from '../../base/monie';
import { useCustomTheme } from '../../provider/customThemeProvider';

export default function Logo() {
  const { darkmode } = useCustomTheme();
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <div className="w-8 h-8 items-center justify-center">
        <Image
          src={`${darkmode ? "/assets/logo-dark.png" : "/assets/logo.png"}`}
          alt="Monie Logo"
          width={35}
          height={35}
          priority
          className="h-8 w-auto"
        />
      </div>
      <Monie width={56} height={24} darkmode={darkmode} />
    </Link>
  );
}