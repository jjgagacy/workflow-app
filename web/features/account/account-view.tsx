import AccountForm from "./account-form";

type AccountViewPageProps = {
    accountId: string;
}
export default async function AccountViewPage({
    accountId
}: AccountViewPageProps) {
    let pageTitle = '添加账户';
    if (accountId !== 'new') {
        pageTitle = '编辑账户';
    }

    return <AccountForm accountId={accountId} pageTitle={pageTitle} />;
}
