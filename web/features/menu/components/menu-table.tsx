'use client';

import api from "@/api";
import { DEBOUNCE_MS, useDataTable } from "@/hooks/use-data-table";
import { PER_PAGE } from "@/utils/search-params";
import { ColumnDef, getExpandedRowModel } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "./data";
import { columnHelper } from "./columns";
import Button from "@/app/components/base/button";
import Link from "next/link";
import { DataTable } from "@/app/ui/table/data-table";
import { DataTableToolbar } from "@/app/ui/table/data-table-toolbar";
import { Input } from "@/app/ui/input";
import { arrayToTree } from "@/utils/trees";

interface MenuTableParams<TData, TValue> {
    data: TData[];
    totalItems: number;
    columns: ColumnDef<TData, TValue>[];
}

export function MenuTable<TData, TValue>({
    columns
}: MenuTableParams<TData, TValue>) {
    const [queryStates, setQueryStates] = useQueryStates({
        search: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
        pageSize: parseAsInteger.withDefault(PER_PAGE)
    });
    const { search, page, pageSize } = queryStates;
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const deleteMenu = api.menu.useDeleteMenu();
    const updateMenu = api.menu.useUpdateMenu();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const { menus, mutate } = api.menu.useGetMenus({ name: debouncedSearch, module: true });
    const [data, setData] = useState<Menu[]>([]);
    const [allMenus, setAllMenus] = useState<Menu[]>([]);

    const filterMenuBySearch = (menus: Menu[], searchItem: string): Menu[] => {
        if (!searchItem.trim()) {
            return menus;
        }

        return menus
            .map(menu => {
                // 获取子菜单
                const filteredChildren = menu.children
                    ? filterMenuBySearch(menu.children, searchItem)
                    : undefined;
                // 检查当前菜单和子菜单是否匹配
                const matchesSearch = menu.name.toLowerCase().includes(searchItem.toLowerCase())
                    || (filteredChildren && filteredChildren.length > 0);
                if (matchesSearch) {
                    return {
                        ...menu,
                        children: filteredChildren
                    };
                }
                return null;
            })
            .filter((menu) => menu !== null);
    }

    useEffect(() => {
        if (menus) {
            const fullMenuTree = arrayToTree(menus, { idKey: 'key', parentKey: 'parent' }) as Menu[];
            setAllMenus(fullMenuTree);

            // 根据搜索条件过滤菜单
            const filteredMenus = filterMenuBySearch(fullMenuTree, debouncedSearch);
            setData(filteredMenus);
        }
    }, [menus, debouncedSearch]);

    const removeMenuFromTree = (menus: Menu[], idToRemove: number): Menu[] => {
        return menus
            .filter(menu => menu.id !== idToRemove) // 移除当前节点
            .map(menu => ({
                ...menu,
                children: menu.children
                    ? removeMenuFromTree(menu.children, idToRemove)
                    : undefined
            }));
    }

    const onDelete = async (menu: Menu) => {
        if (confirm('确认删除吗？')) {
            await deleteMenu(menu.id);
            setData(prev => removeMenuFromTree(prev, menu.id));
        }
    }

    const onToggleStatus = async (menu: Menu) => {
        const newStatus = menu.status === 0 ? 1 : 0;
        await updateMenu({ key: menu.key, name: menu.name, status: newStatus });
        setData(prev =>
            prev.map((item) => item.id === menu.id ? { ...item, status: newStatus } : item)
        );
    }

    const operatorColumn: ColumnDef<Menu, any>[] = [
        columnHelper.display({
            id: "actions",
            header: "操作",
            cell: ({ row }) => {
                const menu = row.original;
                return (
                    <div className="space-x-2">
                        <Button
                            variant={'primary'}
                            className=""
                            size={'small'}
                        >
                            <Link href={`/admin/system/menu/${menu.id}`}>
                                编辑
                            </Link>
                        </Button>
                        <Button
                            onClick={() => onDelete(menu)}
                            variant={'alert'}
                            className=""
                            size={'small'}
                        >
                            删除
                        </Button>
                        <Button
                            onClick={() => onToggleStatus(menu)}
                            variant={'secondary'}
                            className=""
                            size={'small'}
                        >
                            {menu.status === 1 ? "禁用" : "启用"}
                        </Button>
                    </div>
                );
            }
        }),
    ];

    const { table } = useDataTable({
        data,
        columns: [...columns, ...operatorColumn] as ColumnDef<Menu, any>[],
        pageCount: 1,
        shallow: false,
        debounceMs: DEBOUNCE_MS,
        getSubRows: row => row.children,
        getExpandedRowModel: getExpandedRowModel()
    });

    const onReset = useCallback(async () => {
        setQueryStates({ search: null });
        setDebouncedSearch('');
        table.resetColumnFilters();
    }, [table]);

    return (
        <DataTable table={table}>
            <DataTableToolbar table={table}>
                <Input
                    id="search"
                    type="text"
                    value={search}
                    className="w-56"
                    onChange={(e) => {
                        setQueryStates({ search: e.target.value })
                    }}
                    placeholder="按关键词搜索..."
                />
                <Button
                    variant={'ghost'}
                    size={'large'}
                    onClick={() => onReset()}
                >Reset</Button>
            </DataTableToolbar>
        </DataTable>
    );
}
