import { CirclePlus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NodeInput } from "../../components/base/node-input";
import { DeleteButton } from "../../components/base/delete-button";
import { VarPicker } from "../../components/variable/var-picker";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowVariables } from "../../hooks/use-workflowVariables";
import type { Node } from "../../types";
import { createEndOutputItem, EndDefaultData } from "./data";
import type { EndNodeType, EndOutputItem } from "./type";

type EndNodePanelProps = {
  node: Node<EndNodeType>;
};

const EndNodePanel = ({ node }: EndNodePanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { availableNodes, nodeVariableList } = useWorkflowVariables(node.id);

  const outputs = node.data.outputs ?? [];

  const syncNodeData = (patch: Partial<EndNodeType>) => {
    const nextNode = {
      ...node,
      data: {
        ...node.data,
        ...patch,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: patch,
    });
  };

  const upsertOutput = (outputId: string, patch: Partial<EndOutputItem>) => {
    const nextOutputs = outputs.map((item) => {
      if (item.id !== outputId) {
        return item;
      }

      return {
        ...item,
        ...patch,
      };
    });

    syncNodeData({ outputs: nextOutputs });
  };

  const addOutput = () => {
    syncNodeData({ outputs: [...outputs, createEndOutputItem()] });
  };

  const removeOutput = (outputId: string) => {
    const nextOutputs = outputs.filter((item) => item.id !== outputId);
    syncNodeData({ outputs: nextOutputs.length ? nextOutputs : [] });
  };

  return (
    <div className="space-y-0">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || t("workflow.nodes.end.name")}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">{t("workflow.nodes.end.description") || "配置流程结束时返回的输出变量。"}</div>
      </div>

      <section className="mt-3 space-y-2 rounded-xl bg-muted/15 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">输出变量</span>
          <button
            type="button"
            onClick={addOutput}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-background px-2 py-1 text-[10px] text-foreground transition-colors hover:bg-muted/70"
          >
            <CirclePlus className="h-3 w-3" />
            添加
          </button>
        </div>

        {outputs.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-background px-3 py-2 text-xs text-muted-foreground">
            暂无输出变量
          </div>
        ) : (
          <div className="space-y-1.5">
            {outputs.map((item, index) => (
              <div key={item.id} className="rounded-lg border border-[var(--border)] bg-background px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 text-[9px] font-medium text-muted-foreground">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <NodeInput
                      value={item.name}
                      onChange={(event) => upsertOutput(item.id, { name: event.target.value })}
                      placeholder="变量名称"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeOutput(item.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="删除输出变量"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-1.5 pl-7">
                  <VarPicker
                    nodeId={node.id}
                    value={item.valueSelector}
                    onChange={(_, selector) => upsertOutput(item.id, { valueSelector: selector })}
                    availableNodes={availableNodes}
                    nodeOutputVariables={nodeVariableList}
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EndNodePanel;