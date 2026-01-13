'use client';

import api from "@/api";
import Button from "@/app/components/base/button";
import { Input } from "@/app/ui/input";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { columnHelper, createColumns } from "./columns";
import { Account } from "./data";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface AccountTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
}

export function AccountTable<TData, TValue>({ }: AccountTableParams<TData, TValue>) {
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
  const { t } = useTranslation();

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
    if (confirm(t('system.confirm_delete'))) {
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

  const columns = createColumns(t);

  const operatorColumn: ColumnDef<Account, any>[] = [
    columnHelper.display({
      id: "actions",
      header: t('system.operation'),
      meta: { label: t('system.operation') },
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
                {t('system.edit')}
              </Link>
            </Button>
            <Button
              onClick={() => onDelete(account)}
              variant={'alert'}
              className=""
              size={'small'}
            >
              {t('system.delete')}
            </Button>
            <Button
              onClick={() => onToggleStatus(account)}
              variant={'secondary'}
              className=""
              size={'small'}
            >
              {account.status === 1 ? t('system.disable') : t('system.enable')}
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
          placeholder={t('system.search_by_keyword')}
        />
        <Button
          variant={'ghost'}
          size={'large'}
          onClick={() => onReset()}
        >{t('system.reset')}</Button>
      </DataTableToolbar>
    </DataTable>
  );
}