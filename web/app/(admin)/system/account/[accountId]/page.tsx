import Loading from "@/app/components/base/loading";
import { PageContainer } from "@/app/components/layout/page-container";
import AccountViewPage from "@/features/account/account-view";
import { Suspense } from "react";

type PageProps = { params: Promise<{ accountId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<Loading />}>
          <AccountViewPage accountId={params.accountId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
