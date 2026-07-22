import type { NodeData } from "../../types";

export type ScheduleMode = 'visual' | 'cron';
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type ScheduleMeridiem = 'am' | 'pm';
export type ScheduleWeekday = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export type CronSpec = {
  minute: string;
  hour: string;
  day: string;
  month: string;
  week: string;
};

export type ScheduleNodeData = NodeData<{
  mode: ScheduleMode;
  frequency?: ScheduleFrequency;
  minute?: number;
  hour?: number;
  meridiem?: ScheduleMeridiem;
  weekday?: ScheduleWeekday;
  monthDay?: number;
  cron?: Partial<CronSpec>;
}>;
