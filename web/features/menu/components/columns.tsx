'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Menu } from "./data";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

export const columnHelper = createColumnHelper<Menu>();
export const columns: ColumnDef<Menu, any>[] = [
  columnHelper.accessor("name", {
    header: "菜单名称",
    cell: ({ row, getValue }) => (
      <div style={{ paddingLeft: `${row.depth * 2}rem` }}>
        {row.getCanExpand() ? (
          <button
            className="flex items-center"
            onClick={row.getToggleExpandedHandler()}
            style={{ cursor: 'pointer' }}
          >
            {row.getIsExpanded() ? (<IconChevronDown className="w-4 h-4 ml-2 opacity-50" />) : (<IconChevronRight className="w-4 h-4 ml-2 opacity-50" />)} {getValue()}
          </button>
        ) : (
          <span className="ml-4">• {getValue()}</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("sort", {
    header: "排序",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "状态",
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs ${info.getValue() === 1
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
        }`}>
        {info.getValue() === 1 ? "启用" : "禁用"}
      </span>
    ),
  }),
  columnHelper.accessor("module", {
    header: "权限组",
    cell: info => (
      info.getValue() ? (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {info.getValue().name}
        </span>) : ''
    ),
  }),
];