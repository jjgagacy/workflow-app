import type { NodeDefaultData } from "../../types";
import type { CronSpec, ScheduleMeridiem, ScheduleNodeData } from "./types";

const DEFAULT_CRON: CronSpec = {
  minute: '0',
  hour: '*',
  day: '*',
  month: '*',
  week: '*',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const to24Hour = (hour: number, meridiem: ScheduleMeridiem) => {
  const safeHour = clamp(Number.isFinite(hour) ? Math.trunc(hour) : 12, 1, 12);
  if (meridiem === 'am') {
    return safeHour % 12;
  }
  return safeHour % 12 + 12;
};

export const normalizeScheduleMinute = (minute: number) => {
  const safeMinute = Number.isFinite(minute) ? Math.trunc(minute) : 0;
  return clamp(safeMinute, 0, 59);
};

export const normalizeScheduleHour = (hour: number) => {
  const safeHour = Number.isFinite(hour) ? Math.trunc(hour) : 9;
  return clamp(safeHour, 1, 12);
};

export const normalizeScheduleMonthDay = (monthDay: number) => {
  const safeDay = Number.isFinite(monthDay) ? Math.trunc(monthDay) : 1;
  return clamp(safeDay, 1, 31);
};

export const buildScheduleCronExpression = (data: Partial<ScheduleNodeData>) => {
  const mode = data.mode || 'visual';
  const frequency = data.frequency || 'hourly';
  const minute = normalizeScheduleMinute(Number(data.minute));
  const hour = normalizeScheduleHour(Number(data.hour));
  const meridiem = data.meridiem || 'am';
  const weekday = data.weekday || '1';
  const monthDay = normalizeScheduleMonthDay(Number(data.monthDay));

  if (mode === 'cron') {
    const cron = {
      ...DEFAULT_CRON,
      ...(data.cron || {}),
    };

    return `${cron.minute || '*'} ${cron.hour || '*'} ${cron.day || '*'} ${cron.month || '*'} ${cron.week || '*'}`;
  }

  if (frequency === 'hourly') {
    return `${minute} * * * *`;
  }

  const hour24 = to24Hour(hour, meridiem);

  if (frequency === 'daily') {
    return `${minute} ${hour24} * * *`;
  }

  if (frequency === 'weekly') {
    return `${minute} ${hour24} * * ${weekday}`;
  }

  return `${minute} ${hour24} ${monthDay} * *`;
};

export const scheduleNodeDefaultData: NodeDefaultData<ScheduleNodeData> = {
  value: {
    mode: 'visual',
    frequency: 'hourly',
    minute: 0,
    hour: 9,
    meridiem: 'am',
    weekday: '1',
    monthDay: 1,
    cron: DEFAULT_CRON,
  },
};
