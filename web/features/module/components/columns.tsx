'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Module } from "./data";

export const columnHelper = createColumnHelper<Module>();
export const columns: ColumnDef<Module, any>[] = [
  columnHelper.accessor("name", {
    header: "权限组名称",
    cell: info => info.getValue(),
  }),
];
