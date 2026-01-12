'use client';

import z, { iso } from "zod";
import { Module } from "./components/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/app/ui/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import Button from "@/app/components/base/button";
import { Dialog } from "@/app/ui/dialog";
import { useModalContext } from "@/hooks/use-model";

interface ModuleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | undefined;
  onSubmitSuccess: () => void;
}

const formSchema = z.object({
  key: z.string().min(2, {
    error: 'key至少需要2个字符',
  }),
  name: z.string().min(2, {
    error: '部门名称至少需要2个字符'
  }),
});

export function ModuleForm({
  isOpen,
  onOpenChange,
  module,
  onSubmitSuccess
}: ModuleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { modalData } = useModalContext();
  let currentModule = useMemo(() => modalData, [modalData]);
  const updateModule = api.module.useUpdateModule();
  const createModule = api.module.useCreateModule();

  const defaultValues: z.infer<typeof formSchema> = {
    key: currentModule?.key || '',
    name: currentModule?.name || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({ key: '', name: '' });
      module = undefined;
      currentModule = undefined;
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (currentModule) {
        await updateModule({ ...values, id: currentModule.id });
        toast.success('编辑成功');
      } else {
        await createModule({ ...values });
        toast.success('添加成功');
      }
      // 关闭模态框并通知父组件刷新
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
      title={'权限组'}
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
                    <FormLabel>权限组Key</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!!module}
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
                    <FormLabel>权限组名称</FormLabel>
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
        </form>
      </Form>
    </Dialog>
  );
}
