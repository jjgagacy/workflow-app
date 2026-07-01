import { Checkbox } from "@/app/ui/checkbox";
import { SimpleSelect } from "@/app/ui/select";
import { Node } from "../../types";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { WORKFLOW_NODE_ERROR_RESPONSE_OPTIONS } from "../../components/nodes-shared/execution-config";
import type { WorkflowNodeErrorResponse } from "../../components/nodes-shared/execution-config";
import type { IterationNodeData } from "./types";
import IterationSummary from "./summary";
import { useTranslation } from "react-i18next";

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
    <div className="space-y-0">
      <IterationSummary
        label={node.data.label}
        parallelCount={parallelCount}
        errorResponse={errorResponse}
        flat={flat}
      />

      <section className="space-y-4 rounded-xl bg-muted/15 px-4 py-4">
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.iteration.parallelCount')}</div>
          <input
            type="number"
            min={1}
            step={1}
            value={parallelCount}
            onChange={(event) => handleParallelCountChange(event.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {t('workflow.iteration.parallelCountDescription')}
          </div>
        </label>

        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{t('workflow.iteration.errorResponse')}</div>
          <SimpleSelect
            items={errorResponseOptions}
            defaultValue={errorResponse}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ errorResponse: item.value as WorkflowNodeErrorResponse })}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {t('workflow.iteration.errorResponseDescription')}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-background px-3 py-3">
          <Checkbox
            checked={flat}
            onChange={(event) => syncNodeData({ flat: event.target.checked })}
            className="mt-0.5"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">{t('workflow.iteration.flat')}</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {t('workflow.iteration.flatDescription')}
            </span>
          </span>
        </label>
      </section>
    </div>
  );
};

export default IterationPanel;