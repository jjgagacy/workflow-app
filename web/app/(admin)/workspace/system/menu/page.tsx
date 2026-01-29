import { buttonVariants } from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { PageContainer } from "@/app/components/layout/page-container";
import { Separator } from "@/app/ui/separator";
import { cn } from "@/utils/classnames";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "../../../loading";
import MenuListPage from "@/features/menu/menu-list";
import { Metadata } from "next";
import { getServerLocale, useTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'system');
  return {
    title: t('menu_management'),
  };
}

export default async function Page() {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'system');

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title={t('menu_management')}
            description={t('manage_backend_menu_info')}
          />
          <Link
            href='/workspace/system/menu/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className="mr-2 h-4 w-4" /> {t('add_menu')}
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={<Loading />}
        >
          <MenuListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
