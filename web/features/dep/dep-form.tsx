'use client';

import api from "@/api";
import usePageTitle from "@/hooks/use-page-title";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import z from "zod";
import { Department } from "./components/data";
import { arrayToTree, filterCurrentAndChildren } from "@/utils/trees";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import { Textarea } from "@/app/ui/textarea";
import Button from "@/app/components/base/button";
import { TreeSelect } from "@/app/ui/tree-select";
import { toast } from "@/app/ui/toast";

const formSchama = z.object({
    key: z.string().min(2, {
        error: 'key至少需要2个字符',
    }),
    name: z.string().min(2, {
        error: '部门名称至少需要2个字符'
    }),
    parent: z.string(),
    remarks: z.string(),
});

export default function DepartmentForm({
    depKey,
    pageTitle
}: {
    depKey: string;
    pageTitle: string;
}) {
    usePageTitle(pageTitle);
    const [isLoading, setIsLoading] = useState(false);
    const [parentDeps, setParentDeps] = useState<Department[]>([]);
    const [updateDepKey] = useState<string>((depKey && depKey !== 'new' ? depKey : ''));
    const updateDepartment = api.dep.useUpdateDep();
    const createDepartment = api.dep.useCreateDep();
    const router = useRouter();
    let department: Department | null = null;
    if (updateDepKey) {
        const { dep } = api.dep.useGetDepInfo({ key: updateDepKey });
        department = dep;
    }

    const { deps } = api.dep.useGetDeps();
    useEffect(() => {
        if (!deps) return;
        const treeDeps = arrayToTree(deps, { idKey: 'key', parentKey: 'parent' }) as Department[];
        const filteredParentDeps = filterCurrentAndChildren(treeDeps, updateDepKey, 'key')
        setParentDeps(filteredParentDeps);
    }, [deps]);

    const defaultValues: z.infer<typeof formSchama> = {
        key: department?.key || '',
        name: department?.name || '',
        parent: department?.parent || '',
        remarks: department?.remarks || '',
    };
    const form = useForm<z.infer<typeof formSchama>>({
        resolver: zodResolver(formSchama),
        values: defaultValues
    });

    async function onSubmit(values: z.infer<typeof formSchama>) {
        try {
            setIsLoading(true);
            if (updateDepKey) {
                await updateDepartment({ ...values });
                toast.success('编辑成功');
            } else {
                await createDepartment({ ...values });
                toast.success('添加成功');
            }
            router.push('/admin/system/dep');
        } catch (error) {
            console.error(error);
            toast.error('操作失败');
        } finally {
            setIsLoading(false);
        }
    }

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
                                            <FormLabel>上级部门</FormLabel>
                                            <FormControl>
                                                <TreeSelect
                                                    options={parentDeps}
                                                    idKey="key"
                                                    labelKey="name"
                                                    multiple={false}
                                                    search={false}
                                                    selectedIdKey={department?.parent}
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
                                            <FormLabel>部门Key</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={!!updateDepKey}
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
                                            <FormLabel>部门名称</FormLabel>
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
                                    name='remarks'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>备注</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                        </div>

                        <Button className="ml-4" type="submit" disabled={isLoading} loading={isLoading}>{updateDepKey ? '编辑部门' : '添加部门'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}