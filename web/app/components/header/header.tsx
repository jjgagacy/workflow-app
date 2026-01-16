'use client';

import { LayoutDashboard, Workflow } from "lucide-react";
import Button from "../base/button";
import { LanguageSelector } from "../site/header/languageSelector";
import Logo from "../site/header/logo";
import Avatar from "./avatar";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/context/appContext";

export default function Header() {
  const { t } = useTranslation();
  const { accountInfo } = useAppContext();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <Button variant={'ghost'} className='flex items-center'>
                <LayoutDashboard className="mr-1 w-5 h-5" />
                {t('app.back_workspace')}
              </Button>
              <LanguageSelector />
              <Avatar />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}