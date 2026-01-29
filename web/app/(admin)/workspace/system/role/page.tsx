import { PageContainer } from "@/app/components/layout/page-container";
import { Suspense } from "react";
import Loading from "../../../loading";
import { RoleLayout } from "@/features/role/role-layout";

export default function Page() {
  return (
    <PageContainer>
      <Suspense
        fallback={<Loading />}
      >
        <RoleLayout />
      </Suspense>
    </PageContainer>
  );
}