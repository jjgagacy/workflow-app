import { cn } from "@/utils/classnames";
import { Table } from "@tanstack/react-table";

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

        </div>
    );
}
