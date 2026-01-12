import Loading from "@/app/admin/loading";
import { PageContainer } from "@/app/components/layout/page-container";
import MenuViewPage from "@/features/menu/menu-view";
import { Suspense } from "react";

type PageProps = { params: Promise<{ menuId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<Loading />}>
          <MenuViewPage menuId={params.menuId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}