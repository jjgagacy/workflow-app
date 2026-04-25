import { Bot, Database, Workflow } from "lucide-react";

export type AppIconType = 'icon' | 'emoji';

export enum AppMode {
  WORKFLOW = 'workflow',
  CHAT = 'chat'
}

export interface AppModeItem {
  value: AppMode | 'all';
  name: string;
  description: string;
  icon?: React.ComponentType<any>; // 可选：添加图标
  disabled?: boolean; // 可选：是否禁用
}

export const APP_MODE_ITEMS_BASE: Omit<AppModeItem, 'name' | 'description'>[] = [
  { value: AppMode.WORKFLOW },
  { value: AppMode.CHAT },
];

export const getAppModeItems = (t: (key: string) => string): AppModeItem[] => [
  {
    value: AppMode.WORKFLOW,
    name: t('app.types.workflow'),
    description: t('app.newApp.workflowDescription'),
    icon: Workflow
  },
  {
    value: AppMode.CHAT,
    name: t('app.types.chat'),
    description: t('app.newApp.chatDescription'),
    icon: Bot
  },
];

export const getAllAppModes = (t: (key: string) => string): AppModeItem[] => [
  {
    value: 'all',
    name: t('app.types.all'),
    description: '',
    icon: Database,
    disabled: false,
  }, ...getAppModeItems(t)
];
