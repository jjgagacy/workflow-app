'use client';

import z from "zod";
import { Module } from "./components/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/app/ui/toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import { Dialog } from "@/app/ui/dialog";
import { useModalContext } from "@/hooks/use-modal";
import { useTranslation } from "react-i18next";

interface ModuleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | undefined;
  onSubmitSuccess: () => void;
}

export function ModuleForm({
  isOpen,
  onOpenChange,
  onSubmitSuccess
}: ModuleFormProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { modalData: module } = useModalContext();
  let currentModule = useMemo(() => module, [module]);
  const updateModule = api.module.useUpdateModule();
  const createModule = api.module.useCreateModule();

  const formSchema = z.object({
    key: z.string().min(2, {
      error: t('system.permission_group_key_min_length'),
    }),
    name: z.string().min(2, {
      error: t('system.permission_group_name_min_length'),
    }),
  });

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
      currentModule = undefined;
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (currentModule) {
        await updateModule({ ...values, id: currentModule.id });
        toast.success(t('system.edit_success'));
      } else {
        await createModule({ ...values });
        toast.success(t('system.add_success'));
      }
      // 关闭模态框并通知父组件刷新
      onOpenChange(false);
      onSubmitSuccess();
    } catch (error) {
      console.error(error);
      toast.error(t('system.operation_failed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      isLoading={isLoading}
      title={t('system.permission_group')}
      description=""
      confirmText={t('system.confirm')}
      cancelText={t('system.cancel')}
      onConfirm={form.handleSubmit(onSubmit)}
      onCancel={() => {
        onOpenChange(false)
      }}
      className="max-w-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-full space-y-4 rounded">
              <FormField
                control={form.control}
                name='key'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system.permission_group_key')}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!!currentModule}
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
                    <FormLabel>{t('system.permission_group_name')}</FormLabel>
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
