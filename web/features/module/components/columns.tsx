'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Module } from "./data";

export const columnHelper = createColumnHelper<Module>();

export function createColumns(t: (key: string, options?: any) => string): ColumnDef<Module, any>[] {
  return [
    columnHelper.accessor("name", {
      header: t('system.permission_group_name'),
      cell: info => info.getValue(),
    }),
  ];
}
