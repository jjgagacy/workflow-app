'use client';

import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";

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
    const { table } = useDataTable({
        data,
        columns,
        pageCount: pageCount,
        shallow: false, // Setting to false triggers a network request with the updated querystring.
        debounceMs: 500
    });

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table} />
        </DataTable>
    );
}