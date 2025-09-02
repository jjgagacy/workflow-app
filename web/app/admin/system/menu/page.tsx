import { buttonVariants } from "@/app/components/base/button";
import { Heading } from "@/app/components/base/heading";
import { PageContainer } from "@/app/components/layout/page-container";
import { Separator } from "@/app/ui/separator";
import { cn } from "@/utils/classnames";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "../../loading";
import MenuListPage from "@/features/menu/menu-list";

export const metadata = {
    title: 'Dashboard: 菜单列表' 
};

export default function Page() {
    return (
        <PageContainer>
            <div className="flex flex-1 flex-col space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="菜单列表"
                        description="管理您后台的菜单信息"
                    />
                    <Link
                        href='/admin/system/menu/new'
                        className={cn(buttonVariants(), 'text-xs md:text-sm')}
                    >
                        <IconPlus className="mr-2 h-4 w-4" /> 添加菜单
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
