import Loading from "@/app/components/base/loading";
import { PageContainer } from "@/app/components/layout/page-container";
import ProfileLayout from "@/features/workspace/profile-layout";
import { Suspense } from "react";

export default function ProfilePage() {
  return (
    <PageContainer>
      <Suspense
        fallback={<Loading />}
      >
        <ProfileLayout />
      </Suspense>
    </PageContainer>
  );
}