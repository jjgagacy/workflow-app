import { NodeProps } from "@xyflow/react";
import type { Node } from "../../types";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { useTranslation } from "react-i18next";
import { getNodeTypeIconColor } from "../../utils/node";
import { buildScheduleCronExpression } from "./data";
import { ScheduleNodeData } from "./types";

const ScheduleNode = ({ id, data }: NodeProps<Node<ScheduleNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.schedule.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const mode = data.mode || 'visual';
  const frequency = data.frequency || 'hourly';
  const cronExpression = buildScheduleCronExpression(data);
  const modeLabel = mode === 'cron'
    ? t('workflow.nodes.schedule.modeOptions.cron')
    : t('workflow.nodes.schedule.visual', { defaultValue: 'Visual' });
  const frequencyLabel = t(`workflow.nodes.schedule.modeOptions.${frequency === 'hourly' ? 'hour' : frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'
    }`);

  return (
    <div className="schedule-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-xl border border-[var(--border)] bg-muted/20 p-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background px-2.5 py-0">{modeLabel}</span>
                {mode === 'visual' ? (
                  <span className="rounded-full bg-background px-2.5 py-0">{frequencyLabel}</span>
                ) : (
                  <span className="rounded-full bg-background px-2.5 py-0">Cron</span>
                )}
              </div>
              <div className="mt-2 truncate font-mono text-xs text-muted-foreground/80">{cronExpression}</div>
            </div>
          </div>

          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
}

export default ScheduleNode;