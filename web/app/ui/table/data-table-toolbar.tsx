'use client';

import * as React from 'react';
import type { Column, Table } from '@tanstack/react-table';
import { cn } from '@/utils/classnames';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({
    table,
    children,
    className,
    ...props
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    const columns = React.useMemo(
        () => table.getAllColumns().filter(column => column.getCanFilter()),
        [table]
    );

    const onReset = React.useCallback(() => {
        table.resetColumnFilters();
    }, [table]);

    return (
        <div
            role='toolbar'
            aria-orientation='horizontal'
            className={cn(
                'flex w-full items-start justify-between gap-2 p-1',
                className
            )}
            {...props}
        >
            

        </div>
    );
}