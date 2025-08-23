'use client';

import { Input } from "@/app/ui/input";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useEffect } from "react";

interface AccountTableParams<TData, TValue> {
    data: TData[];
    totalItems: number;
    columns: ColumnDef<TData, TValue>[];
}

export function AccountTable<TData, TValue>({
    data,
    totalItems,
    columns
}: AccountTableParams<TData, TValue>) {
    const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(PER_PAGE));
    const pageCount = Math.ceil(totalItems / pageSize);

    const [queryStates, setQueryStates] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        search: parseAsString.withDefault(''),
    });

    const { search, page } = queryStates;

    console.log('page', page);

    const requestAccounts = async (params?: any) => {
        console.log('request...');
    };

    const handleSearch = useDebounceCallback(async () => {
        await requestAccounts();
    }, DEBOUNCE_MS);

    const { table } = useDataTable({
        data,
        columns,
        pageCount: pageCount,
        shallow: false, // Setting to false triggers a network request with the updated querystring.
        debounceMs: 500
    });

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <Input
                    id="search"
                    type="text"
                    value={search} // 直接使用 queryStates 中的 search
                    onChange={(e) => {
                        setQueryStates({ search: e.target.value, page: 1 });
                        handleSearch();
                    }}
                    placeholder="按账户名称搜索..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </DataTableToolbar>
        </DataTable>
    );
}