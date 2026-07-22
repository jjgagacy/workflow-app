import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { Node } from "../../types";
import {
  ScheduleNodeData,
  ScheduleMode,
  ScheduleFrequency,
  ScheduleMeridiem,
  ScheduleWeekday,
  CronSpec
} from "./types";
import {
  buildScheduleCronExpression,
  normalizeScheduleHour,
  normalizeScheduleMinute,
  normalizeScheduleMonthDay,
} from "./data";

export const useScheduleData = (node: Node<ScheduleNodeData>) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();

  // 核心状态解析与兜底
  const mode = (node.data.mode || 'visual') as ScheduleMode;
  const frequency = (node.data.frequency || 'hourly') as ScheduleFrequency;

  const minute = normalizeScheduleMinute(Number(node.data.minute));
  const hour = normalizeScheduleHour(Number(node.data.hour));
  const meridiem = (node.data.meridiem || 'am') as ScheduleMeridiem;
  const weekday = (node.data.weekday || '1') as ScheduleWeekday;
  const monthDay = normalizeScheduleMonthDay(Number(node.data.monthDay));

  const cronSpec = useMemo<CronSpec>(() => ({
    minute: node.data.cron?.minute || '0',
    hour: node.data.cron?.hour || '*',
    day: node.data.cron?.day || '*',
    month: node.data.cron?.month || '*',
    week: node.data.cron?.week || '*',
  }), [node.data.cron]);

  // 兼容老版本生成逻辑的映射表（如果底层 buildScheduleCronExpression 需要老字段名）
  const expression = useMemo(() => {
    return buildScheduleCronExpression({
      ...node.data,
      mode,
      frequency,
      minute,
      hour,
      meridiem,
      weekday,
      monthDay,
      cron: cronSpec,
    });
  }, [node.data, mode, frequency, minute, hour, meridiem, weekday, monthDay, cronSpec]);

  // 数据同步至全局 Store
  const syncNodeData = (patch: Partial<ScheduleNodeData>) => {
    const nextNode = {
      ...node,
      data: { ...node.data, ...patch },
    };
    updateActivePanelNode(nextNode);
    onNodeDataUpdate({ id: node.id, data: patch });
  };

  // 下拉菜单静态配置项
  const selectOptions = useMemo(() => {
    const hourItems = Array.from({ length: 12 }, (_, index) => {
      const value = String(index + 1);
      return { value, name: value };
    });

    return {
      scheduleModeItems: [
        { value: 'visual', name: t('workflow.nodes.schedule.visual', { defaultValue: 'Visual' }) },
        { value: 'cron', name: t('workflow.nodes.schedule.modeOptions.cron') },
      ],
      frequencyItems: [
        { value: 'hourly', name: t('workflow.nodes.schedule.modeOptions.hour') },
        { value: 'daily', name: t('workflow.nodes.schedule.modeOptions.day') },
        { value: 'weekly', name: t('workflow.nodes.schedule.modeOptions.week') },
        { value: 'monthly', name: t('workflow.nodes.schedule.modeOptions.month') },
      ],
      meridiemItems: [
        { value: 'am', name: t('workflow.nodes.schedule.am') },
        { value: 'pm', name: t('workflow.nodes.schedule.pm') },
      ],
      weekdayItems: [
        { value: '1', name: t('workflow.nodes.schedule.weekdays.mon') },
        { value: '2', name: t('workflow.nodes.schedule.weekdays.tue') },
        { value: '3', name: t('workflow.nodes.schedule.weekdays.wed') },
        { value: '4', name: t('workflow.nodes.schedule.weekdays.thu') },
        { value: '5', name: t('workflow.nodes.schedule.weekdays.fri') },
        { value: '6', name: t('workflow.nodes.schedule.weekdays.sat') },
        { value: '0', name: t('workflow.nodes.schedule.weekdays.sun') },
      ],
      hourItems,
    };
  }, [t]);

  return {
    state: { mode, frequency, minute, hour, meridiem, weekday, monthDay, cronSpec, expression },
    options: selectOptions,
    syncNodeData,
  };
};