'use client';

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Account } from "./data";
import { Badge } from "@/app/components/base/badge";

export const columnHelper = createColumnHelper<Account>();
export const columns: ColumnDef<Account, any>[] = [
    columnHelper.accessor("username", {
        header: "账户名",
        cell: info => info.getValue(),
        meta: { label: '账户名', variant: 'text' }
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
            <Badge variant={info.getValue() === 1 ? 'success' : 'danger'}>
                {info.getValue() === 1 ? "启用" : "禁用"}
            </Badge>
        ),
        meta: { label: '状态' }
    }),
];