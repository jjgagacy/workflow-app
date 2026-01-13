import { buttonVariants } from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { PageContainer } from "@/app/components/layout/page-container";
import { Separator } from "@/app/ui/separator";
import { cn } from "@/utils/classnames";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "../../loading";
import AccountListPage from "@/features/account/account-list";
import { getServerLocale, useTranslation } from "@/i18n/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'system');
  return {
    title: t('account_list'),
  };
}

export default async function Page() {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'system');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={t('account_management')}
            description={t('manage_account_info')} />
          <Link
            href='/admin/system/account/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('add_account')}
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={<Loading />}>
          <AccountListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}