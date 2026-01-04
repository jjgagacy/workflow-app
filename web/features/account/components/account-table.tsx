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
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { columnHelper } from "./columns";
import { Account } from "./data";
import Link from "next/link";
import { useUpdate } from "@/hooks/use-update";

interface AccountTableParams<TData, TValue> {
    data: TData[];
    totalItems: number;
    columns: ColumnDef<TData, TValue>[];
}

export function AccountTable<TData, TValue>({
    columns
}: AccountTableParams<TData, TValue>) {
    // const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(PER_PAGE));
    const [queryStates, setQueryStates] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        search: parseAsString.withDefault(''),
        pageSize: parseAsInteger.withDefault(PER_PAGE)
    });
    const { search, page, pageSize } = queryStates;
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const toggleStatusMutation = api.account.useToggleAccountStatus();
    const deleteAccount = api.account.useDeleteAccount();

    useEffect(() => {
        //if (search === '') return;
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const { accounts, mutate } = api.account.useGetAccounts({ username: debouncedSearch, page, limit: pageSize });
    const [data, setData] = useState<Account[]>([]);

    useEffect(() => {
        if (accounts?.data) {
            setData(accounts?.data);
        }
    }, [accounts?.data]);

    const total = accounts?.pageInfo?.total || 0;
    const pageCount = Math.ceil(total / pageSize);

    const onDelete = async (account: Account) => {
        if (confirm('确认删除吗？')) {
            await deleteAccount(account.id);
            setData(prev =>
                prev.filter((item) => item.id !== account.id)
            );
        }
    }

    const onToggleStatus = async (account: Account) => {
        const newStatus = account.status === 0 ? 1 : 0;
        await toggleStatusMutation(account.id);
        setData(prev =>
            prev.map((item) => item.id === account.id ? { ...item, status: newStatus } : item)
        );
    }

    const operatorColumn: ColumnDef<Account, any>[] = [
        columnHelper.display({
            id: "actions",
            header: "操作",
            meta: { label: '操作' },
            cell: ({ row }) => {
                const account = row.original;

                if (account.username === 'admin') {
                    return null;
                }

                return (
                    <div className="flex space-x-2">
                        <Button
                            variant={'primary'}
                            className=""
                            size={'small'}
                        >
                            <Link href={`/admin/system/account/${account.id}`}>
                                编辑
                            </Link>
                        </Button>
                        <Button
                            onClick={() => onDelete(account)}
                            variant={'alert'}
                            className=""
                            size={'small'}
                        >
                            删除
                        </Button>
                        <Button
                            onClick={() => onToggleStatus(account)}
                            variant={'secondary'}
                            className=""
                            size={'small'}
                        >
                            {account.status === 1 ? "禁用" : "启用"}
                        </Button>
                    </div>
                );
            }
        })
    ];

    const { table } = useDataTable({
        data,
        columns: [...columns, ...operatorColumn] as ColumnDef<Account, any>[],
        pageCount,
        shallow: false, // Setting to false triggers a network request with the updated querystring.
        debounceMs: DEBOUNCE_MS,
    });

    const onReset = useCallback(async () => {
        setQueryStates({ page: null, search: null });
        setDebouncedSearch('');
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
                    placeholder="按关键词搜索..."
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