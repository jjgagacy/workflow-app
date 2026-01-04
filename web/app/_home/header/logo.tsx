'use client';

import { Brain } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <span className="text-2xl font-semibold text-gray-900 dark:text-white transition-all duration-300 hover:text-gray-600">
        Monie
      </span>
    </Link>
  );
}