import AccountForm from "./account-form";

type AccountViewPageProps = {
    accountId: string;
}
export default async function AccountViewPage({
    accountId
}: AccountViewPageProps) {
    const pageTitle = accountId !== 'new' ? '编辑账户' : '添加账户';

    return <AccountForm accountId={accountId} pageTitle={pageTitle} />;
}
