import { PageContainer } from "@/app/components/layout/page-container";

type PageProps = { params: Promise<{ accountId: string }> };

export default async function Page(props: PageProps) {
    const params = await props.params;
    const { accountId } = params;
    let account = null;
    let pageTitle = '添加账户';

    if (accountId !== 'new') {
        pageTitle = '编辑账户';
    }

    return (
        <PageContainer>
            <div className='flex-1 space-y-4'>
                <h1>account info</h1>
            </div>
        </PageContainer>
    );
}
