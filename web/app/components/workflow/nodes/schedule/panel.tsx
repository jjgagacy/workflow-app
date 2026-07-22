import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { NodeInput } from "../../components/base/node-input";
import { Node } from "../../types";
import {
  ScheduleNodeData,
  ScheduleMode,
} from "./types";
import { useScheduleData } from "./hooks";
import { VisualConfigForm } from "./components/visual-config-form";

// ==========================================
// 3. 主面板组件 (ScheduleNodePanel)
// ==========================================
type SchedulePanelProps = {
  node: Node<ScheduleNodeData>;
};

const ScheduleNodePanel = ({ node }: SchedulePanelProps) => {
  const { t } = useTranslation();

  // 注入 Hook 隔离数据逻辑
  const { state, options, syncNodeData } = useScheduleData(node);
  const { mode, frequency, minute, hour, meridiem, weekday, monthDay, cronSpec } = state;

  return (
    <div className="space-y-3">
      {/* 头部信息区 */}
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">
          {node.data.label?.trim() || t('workflow.nodes.schedule.name')}
        </div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {t('workflow.nodes.schedule.description2')}
        </div>
      </div>

      {/* 表单配置区 */}
      <section className="space-y-4 rounded-xl bg-muted/15 px-4 py-4">
        {/* 模式选择 (Visual / Cron) */}
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.schedule.mode')}
          </div>
          <SimpleSelect
            items={options.scheduleModeItems}
            defaultValue={mode}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ mode: item.value as ScheduleMode })}
          />
        </div>

        {/* 独立渲染行，清晰分流 */}
        {mode === 'visual' ? (
          <VisualConfigForm
            frequency={frequency}
            minute={minute}
            hour={hour}
            meridiem={meridiem}
            weekday={weekday}
            monthDay={monthDay}
            options={options}
            syncNodeData={syncNodeData}
          />
        ) : (
          <div className="space-y-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {t('workflow.nodes.schedule.cronSpec')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <div className="mb-1 text-xs text-muted-foreground">{t('workflow.nodes.schedule.cron.minute')}</div>
                <NodeInput
                  value={cronSpec.minute}
                  onChange={(event) => syncNodeData({ cron: { ...cronSpec, minute: event.target.value } })}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs text-muted-foreground">{t('workflow.nodes.schedule.cron.hour')}</div>
                <NodeInput
                  value={cronSpec.hour}
                  onChange={(event) => syncNodeData({ cron: { ...cronSpec, hour: event.target.value } })}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs text-muted-foreground">{t('workflow.nodes.schedule.cron.day')}</div>
                <NodeInput
                  value={cronSpec.day}
                  onChange={(event) => syncNodeData({ cron: { ...cronSpec, day: event.target.value } })}
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs text-muted-foreground">{t('workflow.nodes.schedule.cron.month')}</div>
                <NodeInput
                  value={cronSpec.month}
                  onChange={(event) => syncNodeData({ cron: { ...cronSpec, month: event.target.value } })}
                />
              </label>
            </div>
            <label className="block">
              <div className="mb-1 text-xs text-muted-foreground">{t('workflow.nodes.schedule.cron.week')}</div>
              <NodeInput
                value={cronSpec.week}
                onChange={(event) => syncNodeData({ cron: { ...cronSpec, week: event.target.value } })}
              />
            </label>
          </div>
        )}
      </section>
    </div>
  );
};

export default ScheduleNodePanel;