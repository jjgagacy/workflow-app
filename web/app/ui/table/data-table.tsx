import { ScrollArea } from '@/app/components/layout/scroll-area';
import { FilterItemSchema } from '@/utils/parser';
import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type { ColumnSort, Row, RowData } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';
import { getCommonPinningStyles } from '@/utils/data-table';

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
            <div className='relative flex flex-1 min-h-[200px]'>
                <div className='absolute inset-0 flex overflow-hidden rounded-md border border-[var(--border)]'>
                    <ScrollArea className='h-full w-full'>
                        <Table>
                            <TableHeader className='bg-muted sticky top-0 z-10'>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    ...getCommonPinningStyles({ column: header.column })
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                               {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell
                                                key={cell.id}
                                                style={{
                                                    ...getCommonPinningStyles({ column: cell.column })
                                                }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                               )
                                : (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        className='h-24 text-center'
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                               )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </div>
            <div className='flex flex-col gap-2.5'>
                {/* pagination */}
            </div>
        </div>
    );
}

