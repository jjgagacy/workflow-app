'use client';

import Logo from "./logo";
import Navigation from "./navigation";
import Actions from "./actions";

export default function Header() {
  return (
    <header className={`fixed top-0 left-0 right-0 z-100 transition-all duration-300 data-[scrolled=true]:bg-white/95 data-[scrolled=true]:dark:bg-gray-900/95 data-[scrolled=true]:shadow-lg`
    }>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <Navigation />
          <Actions />
        </div>
      </div>
    </header>
  )
}