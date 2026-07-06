import { useState } from "react";
import { FormVariable, Node } from "../../../types";
import { StartNodeData } from "../type";

type UseStartNodeActionsProps = {
  node: Node<StartNodeData>;
  updateActivePanelNode: (node: Node<StartNodeData>) => void;
  onNodeDataUpdate: (payload: { id: string; data: Partial<StartNodeData> }) => void;
};

export const useStartNodeActions = ({
  node,
  updateActivePanelNode,
  onNodeDataUpdate,
}: UseStartNodeActionsProps) => {
  const [editingVariable, setEditingVariable] = useState<FormVariable | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const variables = node.data.formVariables ?? [];

  const syncNodeData = (patch: Partial<StartNodeData>) => {
    const nextNode = {
      ...node,
      data: { ...node.data, ...patch },
    };
    updateActivePanelNode(nextNode);
    onNodeDataUpdate({ id: node.id, data: patch });
  };

  const addVariable = (newVariable: FormVariable) => {
    syncNodeData({
      formVariables: [...variables, newVariable],
    });
  };

  // 2. 修改：保存方法兼容 新增 和 修改
  const saveVariable = (variable: FormVariable) => {
    let nextVariables: FormVariable[];

    if (editingVariable) {
      // 编辑模式：替换掉原有的变量数据（保持原有 ID）
      nextVariables = variables.map((item) => (item.id === variable.id ? variable : item));
    } else {
      // 新增模式：追加到末尾
      nextVariables = [...variables, variable];
    }

    syncNodeData({ formVariables: nextVariables });
    handleCloseDialog();
  };

  const openEditDialog = (variable: FormVariable) => {
    setEditingVariable(variable);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingVariable(null);
    setIsDialogOpen(false);
  };

  const deleteVariable = (id: string) => {
    syncNodeData({
      formVariables: variables.filter((item) => item.id !== id),
    });
  };

  const moveVariable = (id: string, direction: "up" | "down") => {
    const index = variables.findIndex((item) => item.id === id);
    if (index < 0) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= variables.length) return;

    const nextVariables = [...variables];
    const [moved] = nextVariables.splice(index, 1);
    nextVariables.splice(targetIndex, 0, moved);

    syncNodeData({ formVariables: nextVariables });
  };

  return {
    variables,
    isDialogOpen,
    openDialog: () => setIsDialogOpen(true),
    closeDialog: handleCloseDialog,
    addVariable,
    deleteVariable,
    moveVariable,
    saveVariable,
    editingVariable,
    setEditingVariable,
    openEditDialog,
  };
}
