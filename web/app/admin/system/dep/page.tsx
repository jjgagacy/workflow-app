import { buttonVariants } from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { PageContainer } from "@/app/components/layout/page-container";
import { Separator } from "@/app/ui/separator";
import { cn } from "@/utils/classnames";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "../../loading";
import DepartmentListPage from "@/features/dep/dep-list";
import { getServerLocale, useTranslation } from "@/i18n/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = await useTranslation(locale, 'system');
  return {
    title: t('department_management'),
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
            title={t('department_management')}
            description={t('manage_company_departments')} />
          <Link
            href="/admin/system/dep/new"
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className="mr-2 h-4 w-4" /> {t('add_department')}
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={<Loading />}>
          <DepartmentListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}