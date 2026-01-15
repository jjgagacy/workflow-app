import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Account } from "./data";
import { Badge } from "@/app/components/base/badge";

export const columnHelper = createColumnHelper<Account>();
export function createColumns(t: (key: string, options?: any) => string): ColumnDef<Account, any>[] {
  return [
    columnHelper.accessor("username", {
      header: t('system.account_name'),
      cell: info => info.getValue(),
      meta: { label: t('system.account_name'), variant: 'text' }
    }),
    columnHelper.accessor("realName", {
      header: t('system.full_name'),
      cell: info => info.getValue(),
      meta: { label: t('system.full_name') }
    }),
    columnHelper.accessor("mobile", {
      header: t('system.phone'),
      cell: info => info.getValue(),
      meta: { label: t('system.phone') }
    }),
    columnHelper.accessor("email", {
      header: t('system.email'),
      cell: info => info.getValue(),
      meta: { label: t('system.email') }
    }),
    columnHelper.accessor("status", {
      header: t('system.status'),
      cell: info => (
        <Badge variant={info.getValue() === 1 ? 'danger' : 'success'}>
          {info.getValue() === 1 ? t('system.disable') : t('system.enable')}
        </Badge>
      ),
      meta: { label: t('system.status') }
    }),
  ]
}
