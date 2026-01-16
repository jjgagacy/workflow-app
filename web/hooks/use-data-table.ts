'use client';

import { ExtendedColumnSort } from "@/app/ui/table/data-table";
import { getSortingStateParser } from "@/utils/parser";
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { filter, initial } from "lodash-es";

import {
  type Parser,
  type UseQueryStateOptions,
  type UseQueryStatesOptions,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates
} from 'nuqs';
import React from "react";
import { useDebounceCallback } from "./use-debounce-callback";

const PAGE_KEY = 'page';
const PER_PAGE_KEY = 'perPage';
const SORT_KEY = 'sort';
const ARRAY_SEPARATOR = ',';
export const DEBOUNCE_MS = 300; // 防抖：等待一定的时间后执行，如果事件再次出发，则重新计时
export const THROGGLE_MS = 300; // 节流：在一定时间内只允许执行一次

interface UseDataTableProps<TData> extends Omit<
  TableOptions<TData>, // 从 TableOptions<TData> 中排除指定的 6 个属性
  | 'state'
  | 'pageCount'
  | 'getCoreRowModel'
  | 'manualFiltering'
  | 'manualPagination'
  | 'manualSorting'
>,
  Required<Pick<TableOptions<TData>, 'pageCount'>> { // 从 TableOptions<TData> 中只选择 pageCount 属性
  initialState?: Omit<Partial<TableState>, 'sorting'> & {
    sorting?: ExtendedColumnSort<TData>[];
  };
  history?: 'push' | 'replace';
  debounceMs?: number; // 防抖时间，单位毫秒
  throttleMs?: number; // 节流时间，单位毫秒
  clearOnDefault?: boolean; // 是否在默认情况下清除表格状态
  enableAdvancedFilters?: boolean; // 是否启用高级过滤器
  scroll?: boolean; // 是否启用滚动
  shallow?: boolean; // 是否启用浅比较
  startTransition?: React.TransitionStartFunction; // React 18 的 startTransition 函数
  onStateChange?: (params: any) => Promise<any>;
}

export function useDataTable<T>(props: UseDataTableProps<T>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    history = 'replace',
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROGGLE_MS,
    clearOnDefault = false,
    enableAdvancedFilters = false,
    scroll = false,
    shallow = true,
    startTransition,
    ...tableProps
  } = props;

  // This is a very common pattern for optimizing nuqs (or any similar hook) usage in a React component
  // This useMemo is creating a stable options object to pass to useQueryState, excluding the parse function to prevent unnecessary recalculations and re-renders.
  const queryStateOptions = React.useMemo<
    Omit<UseQueryStateOptions<string>, 'parse'>
  >(
    () => ({ // This creates an object containing only the "behavioral" options for the query state hook.
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition
    }),
    [
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition
    ]
  );

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState?.rowSelection ?? {});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState?.columnVisibility ?? {});
  // page: The current value from the URL.
  // A state setter function to update the page in the URL.
  // setPage(2) will update the URL to /?page=2
  // setPage(null) or setPage() will typically clear the page parameter from the URL, reverting the state to the default value (1).
  const [page, setPage] = useQueryState(
    PAGE_KEY,
    parseAsInteger.withOptions(queryStateOptions).withDefault(1)
  );
  const [perPage, setPerPage] = useQueryState(
    PER_PAGE_KEY,
    parseAsInteger.withOptions(queryStateOptions).withDefault(10)
  );
  const pagination: PaginationState = React.useMemo(() => ({
    pageIndex: page - 1, // React Table uses 0-based index for pages
    pageSize: perPage
  }), [page, perPage]);

  const onPaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      if (typeof updater === 'function') {
        const newPagination = updater(pagination);
        setPage(newPagination.pageIndex + 1); // Convert back to 1-based index
        setPerPage(newPagination.pageSize);
      } else {
        setPage(updater.pageIndex + 1); // Convert back to 1-based index
        setPerPage(updater.pageSize);
      }
    },
    [pagination, setPage, setPerPage]
  );

  const columnIds = React.useMemo(() => {
    return new Set(
      columns.map(column => column.id).filter(Boolean) as string[]
    );
  }, [columns]);

  const [sorting, setSorting] = useQueryState(
    SORT_KEY,
    getSortingStateParser<T>(columnIds)
      .withOptions(queryStateOptions)
      .withDefault(initialState?.sorting ?? [])
  );

  const onSortingChange = React.useCallback(
    (updater: Updater<SortingState>) => {
      if (typeof updater === 'function') {
        const newSorting = updater(sorting);
        setSorting(newSorting as ExtendedColumnSort<T>[]);
      } else {
        setSorting(updater as ExtendedColumnSort<T>[]);
      }
    },
    [sorting, setSorting]
  );

  const filterableColumns = React.useMemo(() => {
    if (enableAdvancedFilters) return [];

    return columns.filter(column => column.enableColumnFilter);
  }, [columns, enableAdvancedFilters]);

  const filterParsers = React.useMemo(() => {
    if (enableAdvancedFilters) return {};

    return filterableColumns.reduce<
      Record<string, Parser<string> | Parser<string[]>>
    >((acc, column) => {
      // this might be a place for stricter error handling
      acc[column.id ?? ''] = parseAsString.withOptions(queryStateOptions);
      return acc;
    }, {});
  }, [filterableColumns, queryStateOptions, enableAdvancedFilters]);

  const [filterValues, setFilterValues] = useQueryStates(filterParsers);

  const debouncedSetFilterValues = useDebounceCallback(
    (values: typeof filterValues) => {
      setPage(1);
      setFilterValues(values);
    },
    debounceMs
  );

  // This useMemo hook is designed to initialize the state for a table's column filters based on URL query parameters
  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    if (enableAdvancedFilters) return [];

    return Object.entries(filterValues).reduce<ColumnFiltersState>(
      (filters, [key, value]) => {
        if (value !== null) {
          const processValue = Array.isArray(value)
            ? value
            : typeof value === 'string' && /[^a-zA-Z0-9]/.test(value)
              ? value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
              : [value];
          filters.push({
            id: key,
            value: processValue
          });
        }
        return filters;
      },
      []
    );
  }, [filterValues, enableAdvancedFilters]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters);

  const onColumnFiltersChange = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      if (enableAdvancedFilters) return;

      setColumnFilters(prev => {
        const next =
          typeof updater === 'function'
            ? updater(prev)
            : updater;

        const filterUpdates = next.reduce<
          Record<string, string | string[] | null>
        >((acc, filter) => {
          if (filterableColumns.find(column => column.id === filter.id)) {
            acc[filter.id] = filter.value as string | string[];
          }
          return acc;
        }, {});

        for (const prevFilter of prev) {
          if (!next.some(filter => filter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null;
          }
        }

        debouncedSetFilterValues(filterUpdates);
        return next;
      });
    },
    [debouncedSetFilterValues, filterableColumns, enableAdvancedFilters]
  );

  // 监听状态变化并通知父组件
  React.useEffect(() => {
    if (props.onStateChange) {
      props.onStateChange({
        page,
        sorting,
        perPage,
        filterValues
      });
    }
  }, [page, sorting, perPage, filterValues, props.onStateChange]);

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true
  });

  return { table };
}
