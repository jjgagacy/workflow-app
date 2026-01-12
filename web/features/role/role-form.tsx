'use client';

import api from "@/api";
import { Dialog } from "@/app/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import { toast } from "@/app/ui/toast";
import { TreeSelect } from "@/app/ui/tree-select";
import { useModalContext } from "@/hooks/use-model";
import { Role } from "@/types/role";
import { arrayToTree, filterCurrentAndChildren } from "@/utils/trees";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface RoleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | undefined;
  onSubmitSuccess: () => void;
}

const formSchema = z.object({
  key: z.string().min(2, {
    error: 'key至少需要2个字符',
  }),
  name: z.string().min(2, {
    error: '角色名称至少需要2个字符'
  }),
  parent: z.string()
});

export default function RoleForm({
  isOpen,
  onOpenChange,
  onSubmitSuccess
}: RoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [parentRoles, setParentRoles] = useState<Role[]>([]);
  const { modalData: role } = useModalContext();
  let currentRole = useMemo(() => role, [role]);
  const createRole = api.role.useCreateRole();
  const updateRole = api.role.useUpdateRole();

  const { roles: rolesResult } = api.role.useGetRoles({});
  const roles = rolesResult?.data as Role[];

  useEffect(() => {
    if (roles) {
      const treeRoles = arrayToTree(roles, { idKey: 'key', parentKey: 'parent' }) as Role[];
      const filteredParentRoles = filterCurrentAndChildren(treeRoles, currentRole?.key, 'key');
      setParentRoles(filteredParentRoles);
    }
  }, [roles, currentRole]);

  const defaultValues: z.infer<typeof formSchema> = {
    key: currentRole?.key || '',
    name: currentRole?.name || '',
    parent: currentRole?.parent || '',
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (currentRole) {
        await updateRole({ ...values, id: currentRole.id });
        toast.success('编辑成功');
      } else {
        await createRole({ ...values });
        toast.success('添加成功');
      }
      // 关闭模态框并通知父组件刷新
      currentRole = null;
      form.reset({ key: '', name: '', parent: '' });
      onOpenChange(false);
      onSubmitSuccess();
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      isLoading={isLoading}
      title={'角色'}
      description=""
      confirmText="确定"
      cancelText="取消"
      onConfirm={form.handleSubmit(onSubmit)}
      onCancel={() => {
        onOpenChange(false)
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6 p-4 space-y-4 rounded">
              <FormField
                control={form.control}
                name='key'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色Key</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!!currentRole}
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
                    <FormLabel>角色名称</FormLabel>
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
                name='parent'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上级角色</FormLabel>
                    <FormControl>
                      <TreeSelect
                        options={parentRoles}
                        idKey="key"
                        labelKey="name"
                        multiple={false}
                        search={false}
                        selectedIdKey={currentRole?.parent}
                        onChange={(e) => field.onChange(e?.key)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>

    </Dialog>
  );
}


