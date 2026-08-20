import {
  BookOpenIcon,
  Brain,
  CircuitBoard,
  Code2,
  Database,
  FileText,
  Filter,
  GitBranch,
  GithubIcon,
  Globe,
  Hash,
  HelpCircle,
  ListChecks,
  MergeIcon,
  Play,
  Repeat,
  Search,
  Send,
  SlackIcon,
  Split,
  SquareStack,
  Timer,
  WebhookIcon,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { NodeCatalog, NodeCategory, NodeType } from "./types";

export const NODE_ICON_MAP: Record<NodeType, LucideIcon> = {
  [NodeType.Base]: HelpCircle,
  [NodeType.Start]: HelpCircle,
  [NodeType.End]: HelpCircle,
  [NodeType.Answer]: HelpCircle,
  [NodeType.LLM]: HelpCircle,
  [NodeType.KnowledgeRetrieval]: HelpCircle,
  [NodeType.QuestionClassifier]: HelpCircle,
  [NodeType.IfElse]: HelpCircle,
  [NodeType.Code]: HelpCircle,
  [NodeType.TemplateTransform]: HelpCircle,
  [NodeType.HttpRequest]: HelpCircle,
  [NodeType.VariableAssigner]: HelpCircle,
  [NodeType.VariableAggregator]: HelpCircle,
  [NodeType.ParameterExtractor]: HelpCircle,
  [NodeType.Iteration]: HelpCircle,
  [NodeType.Filter]: HelpCircle,
  [NodeType.DocExtractor]: HelpCircle,
  [NodeType.ListOperator]: HelpCircle,
  [NodeType.Agent]: HelpCircle,
  [NodeType.IterationStart]: HelpCircle,
  [NodeType.Loop]: HelpCircle,
  [NodeType.LoopStart]: HelpCircle,
  [NodeType.LoopEnd]: HelpCircle,
  [NodeType.Webhook]: HelpCircle,
  [NodeType.Schedule]: HelpCircle,
};

export const getNodeIcon = (type?: NodeType, className?: string) => {
  const Icon = type ? NODE_ICON_MAP[type] ?? HelpCircle : HelpCircle;
  return <Icon className={className} />;
};

export const getNodeTypeIcon = (type?: NodeType, className?: string) => getNodeIcon(type, className);

export const NODES_DATA: NodeCatalog[] = [
  // Flow 分类
  // {
  //   id: 'base',
  //   name: 'base',
  //   icon: <InfoIcon />,
  //   category: NodeCategory.FLOW,
  //   section: 'basic',
  //   description: ''
  // },
  {
    id: 'if',
    name: 'if',
    icon: getNodeIcon(NodeType.IfElse),
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  {
    id: 'switch',
    name: 'switch',
    icon: getNodeIcon(NodeType.IfElse),
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  {
    id: 'iteration',
    name: 'iteration',
    icon: getNodeIcon(NodeType.Iteration),
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  // {
  //   id: 'loop',
  //   name: 'loop',
  //   icon: <Repeat2 />,
  //   category: NodeCategory.FLOW,
  //   section: 'flow-control',
  //   description: ''
  // },
  {
    id: 'merge',
    name: 'merge',
    icon: getNodeIcon(NodeType.IfElse),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'filter',
    name: 'filter',
    icon: getNodeIcon(NodeType.Filter),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'code',
    name: 'code',
    icon: getNodeIcon(NodeType.Code),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  // {
  //   id: 'template-transform',
  //   name: 'template-transform',
  //   icon: <Braces />,
  //   category: NodeCategory.FLOW,
  //   section: 'data',
  //   description: ''
  // },
  // {
  //   id: 'variable-assigner',
  //   name: 'variable-assigner',
  //   icon: <Variable />,
  //   category: NodeCategory.FLOW,
  //   section: 'data',
  //   description: ''
  // },
  {
    id: 'variable-aggregator',
    name: 'variable-aggregator',
    icon: getNodeIcon(NodeType.VariableAggregator),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'parameter-extractor',
    name: 'parameter-extractor',
    icon: getNodeIcon(NodeType.ParameterExtractor),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'question-classifier',
    name: 'question-classifier',
    icon: getNodeIcon(NodeType.QuestionClassifier),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'document-extractor',
    name: 'document-extractor',
    icon: getNodeIcon(NodeType.DocExtractor),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'list-operator',
    name: 'list-operator',
    icon: getNodeIcon(NodeType.ListOperator),
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },

  // AI 分类
  {
    id: 'agent',
    name: 'agent',
    icon: getNodeIcon(NodeType.Agent),
    category: NodeCategory.AI,
    section: 'ai',
    description: ''
  },
  {
    id: 'llm',
    name: 'llm',
    icon: getNodeIcon(NodeType.LLM),
    category: NodeCategory.AI,
    section: 'ai',
    description: ''
  },
  {
    id: 'openai',
    name: 'openai',
    icon: <BookOpenIcon />,
    category: NodeCategory.AI,
    section: 'ai',
    description: ''
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    icon: <Zap />,
    category: NodeCategory.AI,
    section: 'ai',
    description: ''
  },
  {
    id: 'vector-store',
    name: 'vector-store',
    icon: <Database />,
    category: NodeCategory.AI,
    section: 'ai',
    description: ''
  },

  // Tools 分类
  {
    id: 'slack',
    name: 'slack',
    icon: <SlackIcon />,
    category: NodeCategory.TOOLS,
    section: 'communication',
    description: ''
  },
  {
    id: 'github',
    name: 'github',
    icon: <GithubIcon />,
    category: NodeCategory.TOOLS,
    section: 'development',
    description: ''
  },
  {
    id: 'google-sheets',
    name: 'google-sheets',
    icon: <Globe />,
    category: NodeCategory.TOOLS,
    section: 'productivity',
    description: ''
  },

  // Core 分类
  {
    id: 'start',
    name: 'start',
    icon: getNodeIcon(NodeType.Start),
    category: NodeCategory.START,
    section: 'start',
    description: ''
  },
  {
    id: 'webhook',
    name: 'webhook',
    icon: getNodeIcon(NodeType.Webhook),
    category: NodeCategory.START,
    section: 'triggers',
    description: ''
  },
  {
    id: 'schedule',
    name: 'schedule',
    icon: getNodeIcon(NodeType.Schedule),
    category: NodeCategory.START,
    section: 'triggers',
    description: ''
  },
  {
    id: 'http-request',
    name: 'http-request',
    icon: getNodeIcon(NodeType.HttpRequest),
    category: NodeCategory.CORE,
    section: 'network',
    description: ''
  },
  {
    id: 'knowledge-retrieval',
    name: 'knowledge-retrieval',
    icon: getNodeIcon(NodeType.KnowledgeRetrieval),
    category: NodeCategory.CORE,
    section: 'knowledge',
    description: ''
  },
];

