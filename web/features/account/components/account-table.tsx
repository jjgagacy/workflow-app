'use client';

import Button from "@/app/components/base/button";
import { Input } from "@/app/ui/input";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useCallback, useEffect } from "react";

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

    const requestAccounts = async (params?: any) => {
        // other filter values, sorting, ...
        console.log('request...', search, page, pageSize);
    };

    const handleSearch = useDebounceCallback(async (params?: any) => {
        await requestAccounts(params);
    }, DEBOUNCE_MS);

    const handleStateChange = async (params?: any) => {
        handleSearch(params);
    }

    const { table } = useDataTable({
        data,
        columns,
        pageCount: pageCount,
        shallow: false, // Setting to false triggers a network request with the updated querystring.
        debounceMs: 500,
        onStateChange: handleStateChange
    });

    const onReset = useCallback(async () => {
        setQueryStates({ page: null, search: null });
        table.resetColumnFilters();
        await requestAccounts();
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
                        handleSearch();
                    }}
                    placeholder="按账户名称搜索..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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