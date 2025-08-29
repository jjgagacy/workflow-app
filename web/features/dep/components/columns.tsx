'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Department } from "./data";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

export const columnHelper = createColumnHelper<Department>();
export const columns: ColumnDef<Department, any>[] = [
    columnHelper.accessor("name", {
            header: "部门名称",
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
            header: "部门Key",
            cell: ({ row, getValue }) => (
                <div>
                    <span className="ml-4">{getValue()}</span>
                </div>
            ),
        }),
];