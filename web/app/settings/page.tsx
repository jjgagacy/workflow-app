import Loading from "@/app/components/base/loading";
import { PageContainer } from "@/app/components/layout/page-container";
import { Suspense } from "react";
import AccountSettingsLayout from "../components/account/settings/account-settings-layout";

export default function ProfilePage() {
  return (
    <PageContainer>
      <Suspense
        fallback={<Loading />}
      >
        <AccountSettingsLayout />
      </Suspense>
    </PageContainer>
  );
}