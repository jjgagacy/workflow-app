import Loading from "@/app/admin/loading";
import { PageContainer } from "@/app/components/layout/page-container";
import DepartmentViewPage from "@/features/dep/dep-view";
import { Suspense } from "react";

type PageProps = { params: Promise<{ depKey: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<Loading />}>
          <DepartmentViewPage depKey={params.depKey} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
