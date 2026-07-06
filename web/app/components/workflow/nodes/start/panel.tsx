import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { CirclePlus } from "lucide-react";
import { StartNodeData } from "./type";
import { Node, FormVariableType } from "../../types";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useStartNodeActions } from "./hooks/use-startNodeActions";
import { VariableListItem } from "./components/variable-list-item";
import { VariableFormModal } from "./components/variable-form-modal";

// 引入刚刚拆分出的自制组件与 Hooks

type StartNodePanelProps = {
  node: Node<StartNodeData>;
};

const StartNodePanel = ({ node }: StartNodePanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();

  // 🛠️ 核心驱动：所有的交互行为都封装到了这个专有 Hook 中
  const {
    variables,
    isDialogOpen,
    openDialog,
    closeDialog,
    deleteVariable,
    moveVariable,
    saveVariable,
    editingVariable,
    setEditingVariable,
    openEditDialog,
  } = useStartNodeActions({ node, updateActivePanelNode, onNodeDataUpdate });

  const typeOptions = useMemo(() => [
    { value: FormVariableType.textInput, label: t("workflow.startPanel.type.textInput") },
    { value: FormVariableType.textArea, label: t("workflow.startPanel.type.textArea") },
    { value: FormVariableType.number, label: t("workflow.startPanel.type.number") },
    { value: FormVariableType.select, label: t("workflow.startPanel.type.select") },
    { value: FormVariableType.multiSelect, label: t("workflow.startPanel.type.multiSelect") },
    { value: FormVariableType.checkbox, label: t("workflow.startPanel.type.checkbox") },
    { value: FormVariableType.radio, label: t("workflow.startPanel.type.radio") },
    { value: FormVariableType.file, label: t("workflow.startPanel.type.file") },
    { value: FormVariableType.fileList, label: t("workflow.startPanel.type.fileList") },
    { value: FormVariableType.boolean, label: t("workflow.startPanel.type.boolean") },
    { value: FormVariableType.object, label: t("workflow.startPanel.type.object") },
    { value: FormVariableType.json, label: t("workflow.startPanel.type.json") },
  ], [t]);

  return (
    <div className="space-y-0">
      {/* 顶部标题卡片 */}
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || t("workflow.nodes.start.name")}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">{t("workflow.nodes.start.description")}</div>
      </div>

      {/* 变量列表配置区 */}
      <section className="mt-3 rounded-xl bg-muted/15 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">{t("workflow.startPanel.formVariables")}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t("workflow.startPanel.variablesConfigured", { count: variables.length })}
            </div>
          </div>
          <button
            type="button"
            onClick={openDialog}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            {t('workflow.startPanel.addVariable')}
          </button>
        </div>

        {/* 变量条目渲染 */}
        {variables.length ? (
          <div className="mt-3 space-y-2">
            {variables.map((item, index) => (
              <VariableListItem
                key={item.id}
                item={item}
                index={index}
                totalCount={variables.length}
                onMove={moveVariable}
                onDelete={deleteVariable}
                onEdit={openEditDialog}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-[var(--border)] bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("workflow.startPanel.empty")}
          </div>
        )}
      </section>

      {/* 独立的表单弹窗组件 */}
      <VariableFormModal
        isOpen={isDialogOpen}
        existingVariables={variables}
        initialVariable={editingVariable}
        onClose={closeDialog}
        onSave={saveVariable}
        typeOptions={typeOptions}
      />
    </div>
  );
};

export default StartNodePanel;