import Image from 'next/image';
import Link from 'next/link';
import { Monie } from '../../base/monie';

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
      <Monie />
    </Link>
  );
}