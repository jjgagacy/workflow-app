import { FilterItemSchema } from '@/utils/parser';
import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type { ColumnSort, Row, RowData } from '@tanstack/react-table';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
    table: TanstackTable<TData>;
    actionBar?: React.ReactNode;
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
    id: Extract<keyof TData, string>; // 从 TData 的所有键名中提取出字符串类型的键名
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>;
}

export function DataTable<TData>({ table, actionBar, children }: DataTableProps<TData>) {
    return (
        <div className='flex flex-1 flex-col space-y-4'>
            {children}
        </div>
    );
}

