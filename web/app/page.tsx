'use client';

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('app.welcome')}</h1>
          <p className="text-gray-600 dark:text-white mb-6">
            {t('app.introduction')}
          </p>
          <Link
            href="/login"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('app.go_to_login')}
          </Link>
        </div>
      </div>
    </>
  );
}
