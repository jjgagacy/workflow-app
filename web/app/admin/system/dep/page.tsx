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

export const metadata = {
    title: 'Dashboard: 部门列表'
};

export default function Page() {
    return (
        <PageContainer>
            <div className="flex flex-1 flex-col space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="部门管理"
                        description="管理您公司内的部门" />
                    <Link
                        href="/admin/system/dep/new"
                        className={cn(buttonVariants(), 'text-xs md:text-sm')}
                    >
                        <IconPlus className="mr-2 h-4 w-4" /> 添加部门
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