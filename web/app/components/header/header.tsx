'use client';

import { ArrowUpRight, LayoutDashboard, Workflow } from "lucide-react";
import Button from "../base/button";
import Logo from "../site/header/logo";
import Avatar from "./avatar";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./navbar/selector/language-selector";

export default function Header() {
  const { t } = useTranslation();

  return (
    <>
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <Button variant={'ghost'}
                className='flex items-center'
                onClick={() => location.href = '/workspace'}
              >
                <LayoutDashboard className="mr-2 w-5 h-5" />
                {t('app.back_workspace')}
                <ArrowUpRight className="w-5 h-5 ml-1" />
              </Button>
              <LanguageSelector reloadPage={false} />
              <Avatar />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}