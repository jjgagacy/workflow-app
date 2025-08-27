'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import usePageTitle from "@/hooks/use-page-title";
import z from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import Button from "@/app/components/base/button";
import { useEffect, useState } from "react";
import api from "@/api";
import { Role } from "@/types/role";
import { arrayToTree, treeToFlatten } from "@/utils/trees";
import { TreeSelect } from "@/app/ui/tree-select";
import { RadioGroup, RadioGroupItem } from "@/app/ui/radio-group";
import Spinner from "@/app/components/base/spinner";
import { toast } from "@/app/ui/toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    username: z.string().min(2, {
        error: '账户名至少需要2个字符'
    }),
    password: z.union([
            z.string().min(4, {
            error: '密码至少需要4个字符',
        }),
        z.string().min(0)
    ]),
    realName: z.string(),
    mobile: z.string(),
    email: z.union([
        z.email({ error: '邮箱格式错误' }).nullable().optional(),
        z.string().min(0)
    ]),
    roles: z.array(z.string()).min(1, {
        error: '至少选择一个角色',
    }),
    status: z.int(),
});

export default function AccountForm({
    accountId,
    pageTitle
}: {
    accountId: string,
    pageTitle: string
}) {
    usePageTitle(pageTitle);
    const [roleSelectList, setRoleSelectList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updateAccountId] = useState<number>((accountId && Number.isFinite(parseInt(accountId)) ? parseInt(accountId) : 0));
    const updateAccount = api.account.useUpdateAccount();
    const createAccount = api.account.useCreateAccount();
    const router = useRouter();
    // get account info if accountId is not empty, and set default values
    let account: any = {};
    if (updateAccountId) {
        const { accounts } = api.account.useGetAccounts({ id: updateAccountId});
        account = accounts?.data[0] || {};
    }
    const defaultValues: z.infer<typeof formSchema> = {
        username: account?.username || '',
        password: '',
        realName: account?.realName || '',
        mobile: account?.mobile || '',
        email: account?.email || '',
        roles: account?.roles || [],
        status: account?.status || 0
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: defaultValues,
    });

    const getRoleIds = (roleKeys: string[]) => {
        const flaternRoles = treeToFlatten(roleSelectList, {
            idKey: 'key',
            parentKey: 'parent',
        });
        const roleMap = new Map(flaternRoles.map((role) => [role.key, role]));
        return roleKeys.map((rolekey) => {
            const role = roleMap.get(rolekey);
            return role ? role.id : 0;
        });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { username, password, roles: roleKeys, ...rest } = values;
        if (!username) {
            form.setError('username', { message: '账户名不能为空' });
            return;
        }

        if (!accountId && !password) {
            form.setError('password', { message: '密码不能为空' });
            return;
        }

        const roleIds = getRoleIds(roleKeys);

        try {
            setIsLoading(true);
            if (updateAccountId) {
                // Ensure email is string or undefined, not null
                const safeRest = {
                    ...rest,
                    email: rest.email ?? undefined,
                };
                await updateAccount({
                    ...safeRest,
                    username,
                    password,
                    roles: roleIds,
                    id: updateAccountId,
                });
                toast.success('编辑成功');
            } else {
                // Ensure email is string or undefined, not null
                const safeRest = {
                    ...rest,
                    email: rest.email ?? undefined,
                };
                await createAccount({
                    ...safeRest,
                    username,
                    password,
                    roles: roleIds,
                });
                toast.success('添加成功');
            }
            router.push('/admin/system/account');
        } catch (error) {
            console.error(error);
            toast.error('操作失败');
        } finally {
            setIsLoading(false);
        }
    }

    const { roles: rolesResult } = api.role.useGetRoles({});
    const roles = rolesResult?.data as Role[];

    useEffect(() => {
        setRoleSelectList(arrayToTree(roles||[], { idKey: 'key', parentKey: 'parent' }));
    }, [roles]);

    return (
        <Card className='mx-auto w-full'>
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
                                    name="username"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>账户名</FormLabel>
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
                                    name="password"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>密码</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="realName"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>姓名</FormLabel>
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
                                    name="mobile"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>手机号</FormLabel>
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
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>邮箱</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <div className="col-span-6 p-4 space-y-4 rounded">
                                <FormField
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>角色</FormLabel>
                                            <FormControl>
                                                <TreeSelect 
                                                    options={roleSelectList} 
                                                    idKey="key" 
                                                    labelKey="name" 
                                                    multiple={true} 
                                                    search={false}
                                                    selectedIdKey={account?.roleKeys}
                                                    onChange={(e) => field.onChange(e)}
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
                            </div>
                        </div>

                        <Button className="ml-4" type="submit" disabled={isLoading} loading={isLoading}>{updateAccountId ? '编辑账户' : '添加账户'}</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}