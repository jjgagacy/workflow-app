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
import { toast } from "@/app/ui/toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  // get account info if accountId is not empty, and set default values

  const formSchema = z.object({
    username: z.string().min(2, {
      error: t('system.account_name_min_length'),
    }),
    password: z.union([
      z.string().min(4, {
        error: t('system.password_min_length'),
      }),
      z.string().min(0)
    ]),
    realName: z.string(),
    mobile: z.string(),
    email: z.union([
      z.email({ error: t('system.email_format_error') }).nullable().optional(),
    ]),
    roles: z.array(z.string()).min(1, {
      error: t('system.select_at_least_one_role'),
    }),
    status: z.int(),
  });

  let account: any = {};
  if (updateAccountId) {
    const { accounts } = api.account.useGetAccounts({ id: updateAccountId });
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
      form.setError('username', { message: t('system.account_name_required') });
      return;
    }

    if (!accountId && !password) {
      form.setError('password', { message: t('system.password_required') });
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
        toast.success(t('system.edit_success'));
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
        toast.success(t('system.add_success'));
      }
      router.push('/admin/system/account');
    } catch (error) {
      console.error(error);
      toast.error(t('system.operation_failed'));
    } finally {
      setIsLoading(false);
    }
  }

  const { roles: rolesResult } = api.role.useGetRoles({});
  const roles = rolesResult?.data as Role[];

  useEffect(() => {
    setRoleSelectList(arrayToTree(roles || [], { idKey: 'key', parentKey: 'parent' }));
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
              <div className="col-span-6 space-y-4 rounded">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.account_name')}</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.email')}</FormLabel>
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.password')}</FormLabel>
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
              </div>

              <div className="col-span-6 space-y-4 rounded">

                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.role')}</FormLabel>
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
                  name="realName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.full_name')}</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('system.phone')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            <Button type="submit" disabled={isLoading} loading={isLoading}>{updateAccountId ? t('system.edit_account') : t('system.add_account')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}