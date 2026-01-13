'use client';

import api from "@/api";
import { Input } from "@/app/ui/input";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { Module } from "./data";
import { columnHelper, createColumns } from "./columns";
import Button from "@/app/components/base/button";
import { useModalContext } from "@/hooks/use-model";
import { ModuleForm } from "../module-form";
import { ModulePermPage } from "../module-perm";
import { useTranslation } from "react-i18next";

interface ModuleTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
}

export function ModuleTable<TData, TValue>({
}: ModuleTableParams<TData, TValue>) {
  const { t } = useTranslation();
  const [queryStates, setQueryStates] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(''),
    pageSize: parseAsInteger.withDefault(PER_PAGE)
  });
  const { search, page, pageSize } = queryStates;
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const deleteModuleMutation = api.module.useDeleteModule();
  const { openModal, closeModal, isModalOpen } = useModalContext();
  const [currentModule, setCurrentModule] = useState<Module | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { modules, mutate } = api.module.useGetModules({ name: debouncedSearch, page, limit: pageSize });
  const [data, setData] = useState<Module[]>([]);

  useEffect(() => {
    if (modules?.data) {
      setData(modules.data);
    }
  }, [modules?.data]);

  const total = modules?.pageInfo?.total || 0;
  const pageCount = Math.ceil(total / pageSize);

  const onDelete = async (module: Module) => {
    if (confirm(t('system.confirm_delete'))) {
      await deleteModuleMutation(module.id);
      setData(prev =>
        prev.filter(item => item.id !== module.id)
      );
    }
  }

  const openEditModal = (module: Module) => {
    setCurrentModule(module);
    openModal('module', module);
  }

  const openPermModal = (module: Module) => {
    setCurrentModule(module);
    openModal('perm', module);
  }

  const handleModuleForm = async () => {
    await mutate();
  }

  const columns = createColumns(t);

  const operatorColumn: ColumnDef<Module, any>[] = [
    columnHelper.display({
      id: "actions",
      header: t('system.operation'),
      cell: ({ row }) => {
        const module = row.original;

        return (
          <div className="space-x-2">
            <Button
              onClick={() => openEditModal(module)}
              variant={'primary'}
              size={'small'}
            >
              {t('system.edit')}
            </Button>
            <Button
              onClick={() => onDelete(module)}
              variant={'alert'}
              size={'small'}
            >
              {t('system.delete')}
            </Button>
            <Button
              onClick={() => openPermModal(module)}
              variant={'secondary'}
              size={'small'}
            >
              {t('system.permission_list')}
            </Button>
          </div>
        );
      },
    }),
  ];

  const { table } = useDataTable({
    data,
    columns: [...columns, ...operatorColumn] as ColumnDef<Module, any>[],
    pageCount,
    shallow: false,
    debounceMs: DEBOUNCE_MS,
  });

  const onReset = useCallback(async () => {
    setQueryStates({ page: null, search: null });
    setDebouncedSearch('');
    table.resetColumnFilters();
  }, [table]);

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Input
            id='search'
            type='text'
            value={search}
            className="w-56"
            onChange={(e) => {
              setQueryStates({ search: e.target.value, page: 1 })
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

      <ModuleForm
        isOpen={isModalOpen('module')}
        onOpenChange={() => closeModal()}
        module={currentModule}
        onSubmitSuccess={handleModuleForm}
      />

      <ModulePermPage
        isOpen={isModalOpen('perm')}
        onOpenChange={() => closeModal()}
        module={currentModule!}
        onSubmitSuccess={handleModuleForm}
      />
    </>
  );
}
