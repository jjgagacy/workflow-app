import { AlignCenterHorizontal, BookOpenIcon, GithubIcon, HandPlatterIcon, InfoIcon, MergeIcon, RectangleGoggles, School, SlackIcon, SwitchCameraIcon, VectorSquare, WebhookIcon } from "lucide-react";
import { NodeCatalog, NodeCategory } from "./types";

export const mockNodes: NodeCatalog[] = [
  // Flow 分类
  { id: 'if', name: 'IF', icon: <InfoIcon />, category: NodeCategory.FLOW, section: 'Flow Control', description: 'Conditional branching' },
  { id: 'switch', name: 'Switch', icon: <SwitchCameraIcon />, category: NodeCategory.FLOW, section: 'Flow Control', description: 'Multiple condition routing' },
  { id: 'merge', name: 'Merge', icon: <MergeIcon />, category: NodeCategory.FLOW, section: 'Data', description: 'Merge multiple branches' },

  // AI 分类
  { id: 'openai', name: 'OpenAI', icon: <BookOpenIcon />, category: NodeCategory.AI, section: 'AI', description: 'GPT models' },
  { id: 'anthropic', name: 'Anthropic', icon: <AlignCenterHorizontal />, category: NodeCategory.AI, section: 'AI', description: 'Claude models' },
  { id: 'vector-store', name: 'Vector Store', icon: <VectorSquare />, category: NodeCategory.AI, section: 'AI', description: 'Vector database operations' },

  // Tools 分 类
  { id: 'slack', name: 'Slack', icon: <SlackIcon />, category: NodeCategory.TOOLS, section: 'Communication', description: 'Send messages to Slack' },
  { id: 'github', name: 'GitHub', icon: <GithubIcon />, category: NodeCategory.TOOLS, section: 'Development', description: 'GitHub operations' },
  { id: 'google-sheets', name: 'Google Sheets', icon: <RectangleGoggles />, category: NodeCategory.TOOLS, section: 'Productivity', description: 'Spreadsheet operations' },

  // Core 分类
  { id: 'webhook', name: 'Webhook', icon: <WebhookIcon />, category: NodeCategory.CORE, section: 'Triggers', description: 'Receive HTTP requests' },
  { id: 'schedule', name: 'Schedule', icon: <School />, category: NodeCategory.CORE, section: 'Triggers', description: 'Scheduled triggers' },
  { id: 'http-request', name: 'HTTP Request', icon: <HandPlatterIcon />, category: NodeCategory.CORE, section: 'Network', description: 'Make HTTP requests' },
];
