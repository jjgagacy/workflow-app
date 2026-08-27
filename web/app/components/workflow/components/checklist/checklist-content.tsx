import { ChevronRight, CircleAlert } from "lucide-react";
import { useStore, useStoreApi } from "@xyflow/react";
import { useWorkflowStore } from "../../context";
import { getNodeTypeIcon } from "../../data";
import type { Node, NodeType } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";

export type ChecklistNodeError = {
  id: string;
  type: string;
  label?: string;
  invalidNode: boolean;
  errorMessage?: string;
};

type ChecklistTypeGroup = {
  type: string;
  label?: string;
  entries: ChecklistNodeError[];
};

export const ChecklistContent = ({
  close,
  items,
}: {
  close: () => void;
  items: ChecklistNodeError[];
}) => {
  const storeApi = useStoreApi();
  const { nodes: workflowNodes } = storeApi.getState();
  const openNodePanel = useWorkflowStore((state) => state.openNodePanel);

  const entries = Object.values(
    items.reduce<Record<string, ChecklistTypeGroup>>((acc, item) => {
      const key = item.type || "unknown";
      const group = acc[key] || {
        type: key,
        label: item.label || key,
        entries: [],
      };

      group.entries.push(item);
      acc[key] = group;
      return acc;
    }, {})
  );

  const totalErrors = items.length;

  const handleOpenNode = (nodeId: string) => {
    const node = workflowNodes.find((item) => item.id === nodeId);

    if (node) {
      openNodePanel(node as Node);
    }

    close();
  };

  return (
    <div className="w-[320px] rounded-xl border border-[var(--border)] bg-background p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <CircleAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">检查清单</div>
            <div className="text-[11px] text-[var(--color-text-secondary)]">共 <span className="text-text-primary font-bold">{totalErrors}</span> 个错误</div>
          </div>
        </div>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {entries.map((group) => (
          <div
            key={group.type}
            className="rounded-lg border border-[var(--border)] bg-[var(--color-muted)]/25 p-2"
          >
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-background ${getNodeTypeIconColor(group.type as NodeType)}`}
              >
                {getNodeTypeIcon(group.type as NodeType, "h-3.5 w-3.5")}
              </div>
              <div className="text-sm font-medium text-[var(--color-text)]">{group.label}</div>
            </div>
            <div className="space-y-2">
              {group.entries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenNode(item.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-transparent bg-background px-2 py-1.5 text-left text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--border)] hover:text-[var(--color-text)]"
                >
                  <span className="line-clamp-2">{item.errorMessage || (item.invalidNode ? "节点配置无效" : item.label || group.label)}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
