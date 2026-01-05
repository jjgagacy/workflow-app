'use client';

import { Brain } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <div className="w-10 h-10 items-center justify-center">
        <Image
          src="/assets/logo.png"
          alt="Monie Logo"
          width={40}
          height={40}
          priority
          className="h-10 w-auto"
        />
      </div>
      <span className="text-2xl font-semibold text-gray-900 dark:text-white transition-all duration-300 hover:text-gray-600">
        Monie
      </span>
    </Link>
  );
}