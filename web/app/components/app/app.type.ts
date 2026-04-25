import { LucideIcon } from 'lucide-react';
import { AppMode } from './constants/appModes';

export interface AppTypeConfig {
  value: AppMode;
  i18n: string;
  icon: string;
}

// 状态类型
export type ApplicationStatus = 'published' | 'draft' | 'archived' | 'shared';
// 状态颜色类型
export type StatusColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue';
// 图标颜色类型
export type IconColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'indigo' | 'orange' | 'cyan';

// Application 接口
export interface Apps {
  id: number;
  name: string;
  type: string;
  status: ApplicationStatus;
  statusText: string;
  statusColor: StatusColor;
  icon: LucideIcon;
  iconColor: IconColor;
  knowledgeBases: number;
  visits: string | null;
  lastEdited: string | null;
  embedAvailable: boolean;
  isStarred: boolean;
  description: string;
  dataTables?: number;
  mcpTools?: number;
}

