'use client';

import api from "@/api";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { Role } from "@/types/role";
import { arrayToTree } from "@/utils/trees";
import { ColumnDef, getExpandedRowModel } from "@tanstack/react-table";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { columnHelper, createColumns } from "./columns";
import { useModalContext } from "@/hooks/use-modal";
import Button from "@/app/components/base/button";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { Input } from "@/app/ui/input";
import RoleForm from "../role-form";
import { useTranslation } from "react-i18next";

interface RoleTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
}

export function RoleTable<TData, TValue>({
}: RoleTableParams<TData, TValue>) {
  const { t } = useTranslation();
  const [queryStates, setQueryStates] = useQueryStates({
    search: parseAsString.withDefault(''),
  });
  const { search } = queryStates;
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const deleteRole = api.role.useDeleteRole();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { roles: rolesResult, mutate } = api.role.useGetRoles({ name: debouncedSearch });
  const roles = rolesResult?.data as Role[];
  const [data, setData] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | undefined>(undefined);
  const { openModal, closeModal, isModalOpen, modalData } = useModalContext();

  const columns = createColumns(t);

  const filterRolesBySearch = (roles: Role[], searchItem: string): Role[] => {
    if (!searchItem.trim()) {
      return roles;
    }

    return roles
      .map(role => {
        // 过滤子角色
        const filteredChildren = role.children
          ? filterRolesBySearch(role.children, searchItem)
          : undefined;
        // 检查当前角色或子角色
        const matchesSearch = role.name.toLowerCase().includes(searchItem.toLowerCase())
          || (filteredChildren && filteredChildren.length > 0);
        if (matchesSearch) {
          return {
            ...role,
            children: filteredChildren
          };
        }
        return null;
      })
      .filter((role) => role !== null);
  }

  useEffect(() => {
    if (roles) {
      const fullRoleTree = arrayToTree(roles, { idKey: 'key', parentKey: 'parent' }) as Role[];
      setAllRoles(fullRoleTree);

      // 根据搜索条件过滤部门
      const filteredRoles = filterRolesBySearch(fullRoleTree, debouncedSearch);
      setData(filteredRoles);
    }
  }, [roles]);

  const removeRoleFromTree = (roles: Role[], idToRemove: number): Role[] => {
    return roles
      .filter(role => role.id !== idToRemove) // 移除当前节点
      .map(role => ({
        ...role,
        children: role.children
          ? removeRoleFromTree(role.children, idToRemove)
          : undefined
      }));
  }

  const onDelete = async (role: Role) => {
    if (confirm(t('system.confirm_delete'))) {
      await deleteRole(role.id);
      setData(prev => removeRoleFromTree(prev, role.id));
    }
  }

  const openEditModal = (role: Role) => {
    setCurrentRole(role);
    openModal('role', role);
  }

  const handleRoleForm = async () => {
    await mutate();
  }

  const operatorColumn: ColumnDef<Role, any>[] = [
    columnHelper.display({
      id: "actions",
      header: t('system.operation'),
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="space-x-2">
            <Button
              onClick={() => openEditModal(role)}
              variant={'primary'}
              size={'small'}
            >
              {t('system.edit')}
            </Button>
            <Button
              onClick={() => onDelete(role)}
              variant={'alert'}
              size={'small'}
            >
              {t('system.delete')}
            </Button>
          </div>
        )
      }
    }),
  ];

  const { table } = useDataTable({
    data,
    columns: [...columns, ...operatorColumn] as ColumnDef<Role, any>[],
    pageCount: 1,
    debounceMs: DEBOUNCE_MS,
    getSubRows: row => row.children,
    getExpandedRowModel: getExpandedRowModel(),
  });

  const onReset = useCallback(async () => {
    setQueryStates({ search: null });
    setDebouncedSearch('');
    table.resetColumnFilters();
  }, [table]);

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Input
            id="search"
            type="text"
            value={search}
            className="w-56"
            onChange={e => {
              setQueryStates({ search: e.target.value });
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

      <RoleForm
        isOpen={isModalOpen('role')}
        onOpenChange={() => closeModal()}
        role={currentRole}
        onSubmitSuccess={handleRoleForm}
      />
    </>
  );
}