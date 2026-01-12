'use client';

import { useEffect, useState } from "react";
import { Module, ModulePerm } from "./components/data";
import { toast } from "@/app/ui/toast";
import api from "@/api";
import { Dialog } from "@/app/ui/dialog";
import Button from "@/app/components/base/button";
import { Input } from "@/app/ui/input";
import { useModalContext } from "@/hooks/use-model";

interface ModulePermProps {
  isOpen: boolean;
  module: Module;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess: () => void;
}

export function ModulePermPage({ isOpen, onOpenChange, onSubmitSuccess }: ModulePermProps) {
  const { modalData: module } = useModalContext();
  const [modulePerms, setModulePerms] = useState<ModulePerm[]>(module?.perms || []);
  const [form, setForm] = useState<Partial<ModulePerm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const createModulePerm = api.module.useCreateModulePerm();
  const updateModulePerm = api.module.useUpdateModulePerm();
  const deleteMOdulePerm = api.module.useDeleteModulePerm();

  // 同步 module.perms 到 modulePerms 状态
  useEffect(() => {
    if (module?.perms) {
      setModulePerms(module.perms);
    } else {
      setModulePerms([]);
    }
  }, [module?.perms]);

  // 处理输入变化
  const handleInputChange = (field: keyof ModulePerm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // 添加新模块
  const handleAdd = () => {
    setIsAdding(true);
    setForm({ key: '', name: '', restrictLevel: 1 });
  }

  // 保存模块
  const handleSave = async () => {
    const { key, name, restrictLevel } = form;

    if (!key || !name || !restrictLevel) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      setIsLoading(true);
      if (isAdding) {
        await createModulePerm({
          module: module.key,
          key: key || '',
          name: name || '',
          restrictLevel: restrictLevel || 1
        });
        const newModulePerm: ModulePerm = {
          key, name, restrictLevel
        };
        setModulePerms(prev => [...prev, newModulePerm]);
        toast.success('添加成功');
        setIsAdding(false);
      } else if (editingId) {
        await updateModulePerm({
          module: module.key,
          key: key || '',
          name: name || '',
          restrictLevel: restrictLevel || 1
        });
        setModulePerms(prev =>
          prev.map(m =>
            m.key === editingId
              ? { ...m, key, name, restrictLevel }
              : m
          )
        );
        toast.success('编辑成功');
        setEditingId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除模块
  const handleDelete = async (key: string) => {
    if (confirm('确定要删除此模块吗？')) {
      try {
        deleteMOdulePerm({ module: module.key, key });
        setModulePerms(prev => prev.filter(m => m.key != key));
        toast.success('删除成功');
      } catch (error) {
        console.error(error);
        toast.error('操作失败');
      }
    }
  }

  // 开始编辑
  const startEdit = (module: ModulePerm) => {
    setEditingId(module.key);
    setForm({ ...module });
  }

  // 取消编辑/添加
  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({})
  }

  return (
    <Dialog
      isOpen={isOpen}
      isLoading={isLoading}
      title={'权限组'}
      description=""
      confirmText="确定"
      cancelText="取消"
      onConfirm={() => {
        onOpenChange(false);
        onSubmitSuccess();
      }}
      onCancel={() => {
        onOpenChange(false)
      }}
      className="max-w-2xl!"
    >
      <div className="w-full mx-auto">
        {/* 添加按钮 */}
        <Button
          onClick={handleAdd}
          variant={'primary'}
          disabled={isAdding || editingId !== null}
          size={'medium'}
          className="mb-2"
        >
          添加权限
        </Button>

        {/* 表格 */}
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权限级别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* 添加行 */}
              {isAdding && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input
                      type="text"
                      value={form.key || ""}
                      onChange={(e) => handleInputChange("key", e.target.value)}
                      placeholder="输入key"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input
                      type="text"
                      value={form.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="输入名称"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input
                      type="number"
                      value={form.restrictLevel || ''}
                      onChange={(e) => handleInputChange("restrictLevel", parseInt(e.target.value) || 1)}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="输入数字"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <Button
                      onClick={handleSave}
                      variant={'warning'}
                      size={'large'}
                    >
                      保存
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant={'secondary'}
                      size={'large'}
                    >
                      取消
                    </Button>
                  </td>
                </tr>
              )}

              {/* 数据行 */}
              {modulePerms.map((module) => (
                <tr key={module.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === module.key ? (
                      <input
                        type="text"
                        value={form.key || ""}
                        onChange={(e) => handleInputChange("key", e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      module.key
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === module.key ? (
                      <input
                        type="text"
                        value={form.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      module.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === module.key ? (
                      <input
                        type="number"
                        value={form.restrictLevel || ""}
                        onChange={(e) => handleInputChange("restrictLevel", parseInt(e.target.value) || 1)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      module.restrictLevel
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    {editingId === module.key ? (
                      <>
                        <Button
                          onClick={handleSave}
                          variant={'primary'}
                          size={'medium'}
                        >
                          保存
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant={'secondary'}
                          size={'medium'}
                        >
                          取消
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => startEdit(module)}
                          variant={'primary'}
                          size={'medium'}
                        >
                          编辑
                        </Button>
                        <Button
                          onClick={() => handleDelete(module.key)}
                          variant={'alert'}
                          size={'medium'}
                        >
                          删除
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </Dialog>
  );
}