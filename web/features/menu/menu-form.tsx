'use client';

import usePageTitle from "@/hooks/use-page-title";
import { useEffect, useState } from "react";
import { Menu } from "./components/data";
import api from "@/api";
import { useRouter } from "next/navigation";
import { arrayToTree, filterCurrentAndChildren } from "@/utils/trees";
import z from "zod";
import { toast } from "@/app/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TreeSelect } from "@/app/ui/tree-select";
import { RadioGroup, RadioGroupItem } from "@/app/ui/radio-group";
import { Module } from "../module/components/data";
import Button from "@/app/components/base/button";
import { Input } from "@/app/ui/input";

const formSchema = z.object({
    key: z.string().min(2, {
        error: 'key至少需要2个字符',
    }),
    name: z.string().min(2, {
        error: '部门名称至少需要2个字符'
    }),
    parent: z.union([
        z.string(),
        z.undefined()
    ]),
    sort: z.number(),
    status: z.number(),
    moduleId: z.union([
        z.number(),
        z.undefined()
    ]),
});

export default function MenuForm({
    menuId,
    pageTitle
}: {
    menuId: number;
    pageTitle: string;
}) {
    usePageTitle(pageTitle);
    const [isLoading, setIsLoading] = useState(false);
    const [updateMenuId] = useState<number>(menuId);
    const [parentMenus, setParentMenus] = useState<Menu[]>([]);
    const updateMenu = api.menu.useUpdateMenu();
    const createMenu = api.menu.useCreateMenu();
    const router = useRouter();
    const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
    const [modules, setModules] = useState<Module[]>([]);

    const { menus } = api.menu.useGetMenus({ module: true });
    const [allMenus, setAllMenus] = useState<Menu[]>([]);

    const { modules: moduleResult } = api.module.useGetModules();

    useEffect(() => {
        if (!menus) return;
        const treeMenus = arrayToTree(menus, { idKey: 'key', parentKey: 'parent' }) as Menu[];
        setAllMenus(treeMenus);
        const updateMenu = menus.find(menu => menu.id === updateMenuId);
        if (updateMenu) setCurrentMenu(updateMenu);
        const filteredParentMenus = filterCurrentAndChildren(treeMenus, updateMenu ? updateMenu['key'] : '', 'key');
        setParentMenus(filteredParentMenus);
    }, [menus, updateMenuId]);

    useEffect(() => {
        if (!moduleResult?.data) return;
        setModules(moduleResult?.data);
    }, [moduleResult?.data]);

    const defaultValues: z.infer<typeof formSchema> = {
        key: currentMenu?.key || '',
        name: currentMenu?.name || '',
        parent: currentMenu?.parent || '',
        status: currentMenu?.status || 1,
        module: currentMenu?.module?.key || '',
        sort: currentMenu?.sort || 0
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values, '-')
        try {
            setIsLoading(true);
            if (updateMenuId) {
                await updateMenu({...values});
                toast.success('编辑成功');
            } else {
                await createMenu({...values});
                toast.success('添加成功');
            }
            router.push('/admin/system/menu');
        } catch (error) {
            console.error(error);
            toast.error('操作失败');
        } finally {
            setIsLoading(false);
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: defaultValues
    });

    return (
        <Card className="mx-auto w-full">
            <CardHeader>
                <CardTitle className="text-left text-2xl font-bold">
                    {pageTitle}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-12 gap-4 mb-8">
                            <div className="col-span-6 p-4 space-y-4 rounded">

                            <FormField
                                control={form.control}
                                name='parent'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>上级菜单</FormLabel>
                                        <FormControl>
                                            <TreeSelect
                                                options={parentMenus}
                                                idKey="key"
                                                labelKey="name"
                                                multiple={false}
                                                search={false}
                                                selectedIdKey={currentMenu?.parent}
                                                onChange={(e) => field.onChange(e?.key)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='key'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>菜单Key</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={!!updateMenuId}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>菜单名称</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='sort'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>排序值</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseInt(e.target.value)||0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>状态</FormLabel>
                                        <RadioGroup
                                            name='status'
                                            defaultValue={field.value}
                                            value={field.value}
                                            onValueChange={(e) => field.onChange(e)}
                                            orientation='horizontal'
                                        >
                                            <RadioGroupItem value={1}>启用</RadioGroupItem>
                                            <RadioGroupItem value={0}>禁用</RadioGroupItem>
                                        </RadioGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='moduleId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>选择权限组</FormLabel>
                                        <FormControl>
                                            <TreeSelect
                                                options={modules}
                                                idKey="id"
                                                labelKey="name"
                                                multiple={false}
                                                search={false}
                                                selectedIdKey={currentMenu?.module?.id}
                                                onChange={(e) => field.onChange(e?.id)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            </div>
                        </div>

                        <Button className="ml-4" type="submit" disabled={isLoading} loading={isLoading}>{updateMenuId ? '编辑菜单' : '添加菜单'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}