import { LucideIcon, MessageSquare } from 'lucide-react';
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

export const testAppInfo: Apps = {
  id: 1,
  name: '智能客服',
  type: 'chat',
  status: 'published',
  statusText: '已发布',
  statusColor: 'green',
  icon: MessageSquare,
  iconColor: 'blue',
  knowledgeBases: 3,
  visits: '1.2K',
  lastEdited: '2024-06-01T12:00:00Z',
  embedAvailable: true,
  isStarred: true,
  description: '一个基于知识库的智能客服应用，支持多轮对话和上下文理解。',
  dataTables: 2,
  mcpTools: 5,
};

export interface AppMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  selectedIcon?: LucideIcon;
}