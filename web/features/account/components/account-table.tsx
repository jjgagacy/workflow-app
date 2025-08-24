'use client';

import api from "@/api";
import Button from "@/app/components/base/button";
import { Input } from "@/app/ui/input";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef } from "@tanstack/react-table";
import request from "graphql-request";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

interface AccountTableParams<TData, TValue> {
    data: TData[];
    totalItems: number;
    columns: ColumnDef<TData, TValue>[];
}

export function AccountTable<TData, TValue>({
    columns
}: AccountTableParams<TData, TValue>) {
    const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(PER_PAGE));
    const [queryStates, setQueryStates] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        search: parseAsString.withDefault(''),
    });
    const { search, page } = queryStates;
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const { accounts, isLoading } = api.account.useGetAccounts({ username: debouncedSearch, page, limit: pageSize });
    const data = accounts?.data || [];
    const total = accounts?.pageInfo?.total || 0;
    const pageCount = Math.ceil(total / pageSize);

    const { table } = useDataTable({
        data,
        columns,
        pageCount: pageCount,
        shallow: false, // Setting to false triggers a network request with the updated querystring.
        debounceMs: 500,
    });

    const onReset = useCallback(async () => {
        setQueryStates({ page: null, search: null });
        table.resetColumnFilters();
    }, [table]);

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <Input
                    id="search"
                    type="text"
                    value={search} // 直接使用 queryStates 中的 search
                    className="w-56"
                    onChange={(e) => {
                        setQueryStates({ search: e.target.value, page: 1 });
                    }}
                    placeholder="按账户名称搜索..."
                />
                <Button
                    variant={'ghost'}
                    size={'large'}
                    onClick={() => onReset()}
                >Reset</Button>
            </DataTableToolbar>
        </DataTable>
    );
}