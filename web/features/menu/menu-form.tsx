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
import { useTranslation } from "react-i18next";

export default function MenuForm({
  menuId,
}: {
  menuId: number;
}) {
  const { t } = useTranslation();
  const pageTitle = menuId > 0 ? t('system.edit_menu') : t('system.add_menu');
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

  const formSchema = z.object({
    key: z.string().min(2, {
      error: t('system.menu_key_min_length'),
    }),
    name: z.string().min(2, {
      error: t('system.menu_name_min_length'),
    }),
    parent: z.union([
      z.string(),
      z.undefined()
    ]),
    sort: z.number(),
    status: z.number(),
    module: z.union([
      z.string(),
      z.undefined()
    ]),
  });

  const defaultValues: z.infer<typeof formSchema> = {
    key: currentMenu?.key || '',
    name: currentMenu?.name || '',
    parent: currentMenu?.parent || '',
    status: currentMenu?.status || 1,
    module: currentMenu?.module?.key || '',
    sort: currentMenu?.sort || 0
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (updateMenuId) {
        await updateMenu({ ...values });
        toast.success(t('system.edit_success'));
      } else {
        await createMenu({ ...values });
        toast.success(t('system.add_success'));
      }
      router.push('/admin/system/menu');
    } catch (error) {
      console.error(error);
      toast.error(t('system.operation_failed'));
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
                      <FormLabel>{t('system.parent_menu')}</FormLabel>
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
                      <FormLabel>{t('system.menu_key')}</FormLabel>
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
                      <FormLabel>{t('system.menu_name')}</FormLabel>
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
                      <FormLabel>{t('system.sort_order')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
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
                      <FormLabel>{t('system.status')}</FormLabel>
                      <RadioGroup
                        name='status'
                        defaultValue={field.value}
                        value={field.value}
                        onValueChange={(e) => field.onChange(e)}
                        orientation='horizontal'
                      >
                        <RadioGroupItem value={1}>{t('system.enable')}</RadioGroupItem>
                        <RadioGroupItem value={0}>{t('system.disable')}</RadioGroupItem>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='module'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.select_permission_group')}</FormLabel>
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

            <Button className="ml-4" type="submit" disabled={isLoading} loading={isLoading}>{updateMenuId ? t('system.edit_menu') : t('system.add_menu')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}