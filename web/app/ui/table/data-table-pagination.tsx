import { cn } from "@/utils/classnames";
import { Table } from "@tanstack/react-table";
import { Select } from "../select";
import Button from "@/app/components/base/button";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";

interface DataTablePaginationProps<TData> extends React.ComponentProps<'div'> {
    table: Table<TData>;
    pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
    table,
    pageSizeOptions = [10, 20, 30, 40, 50],
    className,
    ...props
}: DataTablePaginationProps<TData>) {
    return (
        <div
            className={cn(
                'flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8',
                className
            )}
            {...props}
        >
            <div
                className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
            >
                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                    <>
                        {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </>
                ) : (
                    <>{table.getFilteredRowModel().rows.length} row(s) total.</>
                )}
            </div>
            <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onChange={(event) => {
                            table.setPageSize(Number(event.target.value))
                        }}
                    >
                        {pageSizeOptions.map((pageSize) => (
                            <option key={pageSize} value={pageSize}>{pageSize}</option>
                        ))}
                    </Select>
                </div>
                <div className="flex items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        aria-label="Go to first page"
                        variant={'ghost'}
                        className="size-10 flex items-center justify-center"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IconChevronsLeft />
                    </Button>
                    <Button
                        aria-label="Go to previous page"
                        variant={'ghost'}
                        className="size-10 flex items-center justify-center"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <IconChevronLeft />
                    </Button>
                    <Button
                        aria-label="Go to next page"
                        variant={'ghost'}
                        className="size-10 flex items-center justify-center"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <IconChevronRight />
                    </Button>
                    <Button
                        aria-label="Go to last page"
                        variant={'ghost'}
                        className="size-10 flex items-center justify-center"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <IconChevronsRight className="" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
