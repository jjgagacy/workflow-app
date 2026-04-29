'use client';

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import Loading from "../../base/loading";

type AppLayoutProps = {
  children: React.ReactNode;
  appId: string;
}

const AppLayout = ({ children, appId }: AppLayoutProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  // return (
  //   <div className='flex h-full items-center justify-center bg-background-body'>
  //     <Loading />
  //   </div>
  // )

  return (
    <>
      {children}
    </>
  );
}

export default React.memo(AppLayout, (prev, next) => {
  return prev.appId === next.appId;
});