'use client';

import api from "@/api";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { ColumnDef, getExpandedRowModel } from "@tanstack/react-table";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { Department } from "./data";
import { arrayToTree } from "@/utils/trees";
import { columnHelper, createColumns } from "./columns";
import Button, { buttonVariants } from "@/app/components/base/button";
import Link from "next/link";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { Input } from "@/app/ui/input";
import { cn } from "@/utils/classnames";
import { useTranslation } from "react-i18next";

interface DepartmentTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
}

export function DepartmentTable<TData, TValue>({ }: DepartmentTableParams<TData, TValue>) {
  const [queryStates, setQueryStates] = useQueryStates({
    search: parseAsString.withDefault(''),
  });
  const { search } = queryStates;
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const deleteDepartment = api.dep.useDeleteDep();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { deps } = api.dep.useGetDeps({ name: debouncedSearch });
  const [data, setData] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  const filterDepartmentsBySearch = (departments: Department[], searchItem: string): Department[] => {
    if (!searchItem.trim()) {
      return departments;
    }

    return departments
      .map(department => {
        // 过滤子部门
        const filteredChildren = department.children
          ? filterDepartmentsBySearch(department.children, searchItem)
          : undefined;
        // 检查当前部门或子部门是否匹配搜索
        const matchesSearch = department.name.toLowerCase().includes(searchItem.toLowerCase())
          || department.remarks?.toLowerCase().includes(searchItem.toLowerCase())
          || (filteredChildren && filteredChildren.length > 0);
        if (matchesSearch) {
          return {
            ...department,
            children: filteredChildren
          };
        }
        return null;
      })
      .filter((department) => department !== null);
  }

  useEffect(() => {
    if (deps) {
      const fullDepartmentTree = arrayToTree(deps, { idKey: 'key', parentKey: 'parent' }) as Department[];
      setAllDepartments(fullDepartmentTree);

      // 根据搜索条件过滤部门
      const filteredDepartments = filterDepartmentsBySearch(fullDepartmentTree, debouncedSearch);
      setData(filteredDepartments);
    }
  }, [deps, debouncedSearch]);

  const removeDepartmentFromTree = (deps: Department[], idToRemove: number): Department[] => {
    return deps
      .filter(dep => dep.id !== idToRemove) // 移除当前节点
      .map(dep => ({
        ...dep,
        children: dep.children
          ? removeDepartmentFromTree(dep.children, idToRemove) // 递归处理子节点
          : undefined
      }));
  }

  const onDelete = async (dep: Department) => {
    if (confirm('确认删除吗？')) {
      await deleteDepartment(dep.id);
      setData(prev => removeDepartmentFromTree(prev, dep.id));
    }
  }

  const columns = createColumns(t);

  const operatorColumn: ColumnDef<Department, any>[] = [
    columnHelper.display({
      id: "actions",
      header: t('system.operation'),
      cell: ({ row }) => {
        const dep = row.original;
        return (
          <div className="space-x-2">
            <Link
              href={`/admin/system/dep/${dep.key}`}
              className={cn(buttonVariants({ size: 'small' }))}
            >
              {t('system.edit')}
            </Link>
            <Button
              onClick={() => onDelete(dep)}
              variant={'alert'}
              className=""
              size={'small'}
            >
              {t('system.delete')}
            </Button>
          </div>
        );
      }
    }),
  ];

  const { table } = useDataTable({
    data,
    columns: [...columns, ...operatorColumn] as ColumnDef<Department, any>[],
    pageCount: 1,
    debounceMs: DEBOUNCE_MS,
    getSubRows: row => row.children,
    getExpandedRowModel: getExpandedRowModel(),
  });

  const onReset = useCallback(async () => {
    setQueryStates({ search: null });
    setDebouncedSearch('');
    table.resetColumnFilters();
  }, [table]);


  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <Input
          id="search"
          type="text"
          value={search}
          className="w-56"
          onChange={e => {
            setQueryStates({ search: e.target.value })
          }}
          placeholder={t('system.search_by_keyword')}
        />
        <Button
          variant={'ghost'}
          size={'large'}
          onClick={() => onReset()}
        >
          {t('system.reset')}
        </Button>
      </DataTableToolbar>
    </DataTable>
  );
}