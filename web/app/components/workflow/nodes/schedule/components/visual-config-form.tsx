import React from "react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { ScheduleNodeData, ScheduleFrequency, ScheduleMeridiem, ScheduleWeekday } from "../types";
import { normalizeScheduleMinute, normalizeScheduleHour, normalizeScheduleMonthDay } from "../data";
import { NodeInput } from "../../../components/base/node-input";

type VisualConfigFormProps = {
  frequency: ScheduleFrequency;
  minute: number;
  hour: number;
  meridiem: ScheduleMeridiem;
  weekday: ScheduleWeekday;
  monthDay: number;
  options: any;
  syncNodeData: (patch: Partial<ScheduleNodeData>) => void;
};

export const VisualConfigForm = ({
  frequency,
  minute,
  hour,
  meridiem,
  weekday,
  monthDay,
  options,
  syncNodeData,
}: VisualConfigFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* 频率选择 */}
      <div>
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.schedule.frequency', { defaultValue: 'Frequency' })}
        </div>
        <SimpleSelect
          items={options.frequencyItems}
          defaultValue={frequency}
          allowSearch={false}
          className="w-full"
          onSelect={(item) => syncNodeData({ frequency: item.value as ScheduleFrequency })}
        />
      </div>

      {/* 分钟输入 */}
      <label className="block">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t('workflow.nodes.schedule.minute')}
        </div>
        <NodeInput
          type="number"
          min={0}
          max={59}
          step={1}
          value={minute}
          onChange={(event) => syncNodeData({ minute: normalizeScheduleMinute(Number(event.target.value)) })}
        />
      </label>

      {/* 时间选择 (除每小时 hourly 外可见) */}
      {frequency !== 'hourly' && (
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.schedule.time')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SimpleSelect
              items={options.meridiemItems}
              defaultValue={meridiem}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ meridiem: item.value as ScheduleMeridiem })}
            />
            <SimpleSelect
              items={options.hourItems}
              defaultValue={String(hour)}
              allowSearch={false}
              className="w-full"
              onSelect={(item) => syncNodeData({ hour: normalizeScheduleHour(Number(item.value)) })}
            />
            <div className="flex items-center rounded-md border border-[var(--border)] bg-background px-3 text-sm text-muted-foreground">
              {t('workflow.nodes.schedule.oclock')}
            </div>
          </div>
        </div>
      )}

      {/* 周几选择 (仅按周 weekly 可见) */}
      {frequency === 'weekly' && (
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.schedule.weekday')}
          </div>
          <SimpleSelect
            items={options.weekdayItems}
            defaultValue={weekday}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => syncNodeData({ weekday: item.value as ScheduleWeekday })}
          />
        </div>
      )}

      {/* 每月几号选择 (仅按月 monthly 可见) */}
      {frequency === 'monthly' && (
        <label className="block">
          <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t('workflow.nodes.schedule.monthDay')}
          </div>
          <NodeInput
            type="number"
            min={1}
            max={31}
            step={1}
            value={monthDay}
            onChange={(event) => syncNodeData({ monthDay: normalizeScheduleMonthDay(Number(event.target.value)) })}
          />
        </label>
      )}
    </div>
  );
};