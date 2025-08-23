import { searchParams } from "@/utils/search-params";
import { AccountTable } from "./components/account-table";
import { Account } from "./components/data";
import { columns } from "./components/columns";

export default async function AccountListPage() {
    const page = searchParams.page;
    const pageLimit = searchParams.perPage;
    const keyword = searchParams.keyword;

    const filters = {
        page,
        limit: pageLimit,
        ...(keyword && { keyword }),
    };

    // 根据filter获取数据

    const accounts: Account[] = [];
    const totalAccounts = 0;

    return (
        <AccountTable
            data={accounts}
            totalItems={totalAccounts}
            columns={columns}
        />
    );
}