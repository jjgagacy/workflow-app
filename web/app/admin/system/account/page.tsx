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

export const metadata = {
    title: 'Dashboard: 账户列表'
};

export default function Page() {
    return (
        <PageContainer>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className='flex items-start justify-between'>
                    <Heading
                        title="账户管理"
                        description="管理您的账户信息" />
                    <Link
                        href='/admin/system/account/new'
                        className={cn(buttonVariants(), 'text-xs md:text-sm')}
                    >
                        <IconPlus className='mr-2 h-4 w-4' /> 添加账户
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