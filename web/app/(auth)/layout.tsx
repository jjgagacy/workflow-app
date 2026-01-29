import React from "react";
import SwrInitializer from "../components/swr-initializer";
import Logo from "../components/site/header/logo";
import ThemeToggle from "../components/site/header/appearanceToggle";
import { LanguageSelector } from "../components/site/header/languageSelector";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <SwrInitializer>
        {children}
      </SwrInitializer>
    </div>
  );
}