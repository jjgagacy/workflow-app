export enum NodeCategory {
  FLOW = 'flow',
  TOOLS = 'tools',
  AI = 'ai',
  CORE = 'core',
}

export type NodeCategoryType =
  | NodeCategory.FLOW
  | NodeCategory.TOOLS
  | NodeCategory.AI
  | NodeCategory.CORE;

export interface NodeCategoryInfo {
  type: NodeCategoryType;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface BaseNodeType {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface NodeCatalog extends BaseNodeType {
  category: NodeCategoryType;
  section?: string;
}
