'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Menu } from "./data";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

export const columnHelper = createColumnHelper<Menu>();
export function createColumns(t: (key: string, options?: any) => string): ColumnDef<Menu, any>[] {
  return [
    columnHelper.accessor("name", {
      header: t('system.menu_name'),
      cell: ({ row, getValue }) => (
        <div style={{ paddingLeft: `${row.depth * 2}rem` }}>
          {row.getCanExpand() ? (
            <button
              className="flex items-center"
              onClick={row.getToggleExpandedHandler()}
              style={{ cursor: 'pointer' }}
            >
              {row.getIsExpanded()
                ? (<IconChevronDown className="w-4 h-4 ml-2 opacity-50" />)
                : (<IconChevronRight className="w-4 h-4 ml-2 opacity-50" />)} {getValue()}
            </button>
          ) : (
            <span className="ml-4">• {getValue()}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("sort", {
      header: t('system.sort_order'),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: t('system.status'),
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs ${info.getValue() === 1
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
          }`}>
          {info.getValue() === 1 ? t('system.enable') : t('system.disable')}
        </span>
      ),
    }),
    columnHelper.accessor("module", {
      header: t('system.permission_group'),
      cell: info => (
        info.getValue() ? (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            {info.getValue().name}
          </span>) : ''
      ),
    }),
  ];
}