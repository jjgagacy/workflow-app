import { Bot, GitBranch, Library, LucideIcon, Table, Workflow } from "lucide-react";

export enum AppType {
  WORKFLOW = 'workflow',
  CHAT = 'chat',
  KNOWLEDGE = 'knowledge',
  TABLE = 'table',
}

export interface AppTypeItem {
  name: string;
  value: AppType;
  icon: LucideIcon;
}

export const APP_TYPE_CONFIG: Record<AppType, AppTypeItem> = {
  [AppType.WORKFLOW]: { name: 'app.types.workflow', value: AppType.WORKFLOW, icon: GitBranch },
  [AppType.CHAT]: { name: 'app.types.chat', value: AppType.CHAT, icon: Bot },
  [AppType.KNOWLEDGE]: { name: 'app.types.knowledge', value: AppType.KNOWLEDGE, icon: Library },
  [AppType.TABLE]: { name: 'app.types.table', value: AppType.TABLE, icon: Table },
};

export const getAllAppTypes = (t: (key: string) => string) => {
  return Object.values(AppType).map((appType) => ({
    ...APP_TYPE_CONFIG[appType],
    name: t(APP_TYPE_CONFIG[appType].name),
  }));
};
