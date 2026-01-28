'use client';

import usePageTitle from "@/hooks/use-page-title";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ActivateForm from "./activate-form";

export default function ActivatePage() {
  const { t } = useTranslation();
  usePageTitle(t('account.activate_account'));


  return (
    <>
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ActivateForm />
      </main>
    </>
  );
}