'use client';

import { Role } from "@/types/role";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

export const columnHelper = createColumnHelper<Role>();

export function createColumns(t: (key: string, options?: any) => string): ColumnDef<Role, any>[] {
  return [
    columnHelper.accessor("name", {
      header: t('system.role_name'),
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
    columnHelper.accessor("key", {
      header: t('system.role_key'),
      cell: ({ row, getValue }) => (
        <div>
          <span className="ml-4">{getValue()}</span>
        </div>
      ),
    }),
  ];
}