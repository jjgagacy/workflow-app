import { PageContainer } from "@/app/components/layout/page-container";
import { Suspense } from "react";
import Loading from "../../loading";
import { ModuleLayout } from "@/features/module/model-layout";

export default function Page() {
    return (
        <PageContainer>
            <Suspense   
                fallback={<Loading />}
            >
                <ModuleLayout />
            </Suspense>
        </PageContainer>
    );
}