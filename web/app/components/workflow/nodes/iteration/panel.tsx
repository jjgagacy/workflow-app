import { useTranslation } from "react-i18next";
import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { Node } from "../../types";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS } from "../../components/nodes-shared/execution-config";
import type { WorkflowNodeErrorResponse } from "../../components/nodes-shared/execution-config";
import type { IterationNodeData } from "./types";

type IterationPanelProps = {
  node: Node<IterationNodeData>;
};

const IterationPanel = ({ node }: IterationPanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();

  const parallelCount = Math.max(1, Number(node.data.parallelCount) || 1);
  const errorResponse = node.data.errorResponse || 'stop-workflow';
  const flat = Boolean(node.data.flat);
  const errorResponseOptions = WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS.map((option) => ({
    value: option.value,
    name: option.label,
    description: option.description,
  }));

  const syncNodeData = (patch: Partial<IterationNodeData>) => {
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

  const handleParallelCountChange = (value: string) => {
    const numericValue = Number.parseInt(value, 10);
    syncNodeData({
      parallelCount: Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">{node.data.label?.trim() || t('workflow.nodes.iteration.name')}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.iteration.description')}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            并行 {parallelCount}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">
            {WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS.find((option) => option.value === errorResponse)?.label || '停止工作流'}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">
            {flat ? 'Flat 输出' : '保留嵌套输出'}
          </span>
        </div>
      </div>

      <section className="space-y-4 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">并行数量</div>
          <input
            type="number"
            min={1}
            step={1}
            value={parallelCount}
            onChange={(event) => handleParallelCountChange(event.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            控制同时执行的迭代任务数量，默认 1。
          </div>
        </label>

        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">错误响应</div>
          <SimpleSelect
            items={errorResponseOptions}
            defaultValue={errorResponse}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ errorResponse: item.value as WorkflowNodeErrorResponse })}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            选择迭代过程中某一项失败时的处理方式。
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
          <Checkbox
            checked={flat}
            onChange={(event) => syncNodeData({ flat: event.target.checked })}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">扁平化输出</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              启用后会将每次迭代的结果合并为扁平数组输出。
            </span>
          </span>
        </label>
      </section>
    </div>
  );
};

export default IterationPanel;