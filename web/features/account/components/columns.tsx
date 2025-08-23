'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Account } from "./data";

const columnHelper = createColumnHelper<Account>();
export const columns: ColumnDef<Account, any>[] = [
    columnHelper.accessor("username", {
        header: "账户名",
        cell: info => info.getValue(),
        meta: { label: '账户名' }
    }),
    columnHelper.accessor("realName", {
        header: "姓名",
        cell: info => info.getValue(),
        meta: { label: '姓名' }
    }),
    columnHelper.accessor("mobile", {
        header: "手机",
        cell: info => info.getValue(),
        meta: { label: '手机' }
    }),
    columnHelper.accessor("email", {
        header: "邮箱",
        cell: info => info.getValue(),
        meta: { label: '邮箱' }
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
        meta: { label: '状态' }
    }),
];