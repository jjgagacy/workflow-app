import {
  BookOpenIcon,
  Braces,
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
  InfoIcon,
  ListChecks,
  MergeIcon,
  Repeat,
  Repeat2,
  Search,
  Send,
  SlackIcon,
  Split,
  SquareStack,
  Timer,
  Variable,
  WebhookIcon,
  Zap
} from "lucide-react";
import { NodeCatalog, NodeCategory } from "./types";

export const NODES_DATA: NodeCatalog[] = [
  // Flow 分类
  {
    id: 'base',
    name: 'base',
    icon: <InfoIcon />,
    category: NodeCategory.FLOW,
    section: 'basic',
    description: ''
  },
  {
    id: 'if',
    name: 'if',
    icon: <GitBranch />,
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  {
    id: 'switch',
    name: 'switch',
    icon: <Split />,
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  {
    id: 'iteration',
    name: 'iteration',
    icon: <Repeat />,
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  {
    id: 'loop',
    name: 'loop',
    icon: <Repeat2 />,
    category: NodeCategory.FLOW,
    section: 'flow-control',
    description: ''
  },
  {
    id: 'merge',
    name: 'merge',
    icon: <MergeIcon />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'filter',
    name: 'filter',
    icon: <Filter />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'code',
    name: 'code',
    icon: <Code2 />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'template-transform',
    name: 'template-transform',
    icon: <Braces />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'variable-assigner',
    name: 'variable-assigner',
    icon: <Variable />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'variable-aggregator',
    name: 'variable-aggregator',
    icon: <SquareStack />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'parameter-extractor',
    name: 'parameter-extractor',
    icon: <Hash />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'question-classifier',
    name: 'question-classifier',
    icon: <HelpCircle />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'document-extractor',
    name: 'document-extractor',
    icon: <FileText />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },
  {
    id: 'list-operator',
    name: 'list-operator',
    icon: <ListChecks />,
    category: NodeCategory.FLOW,
    section: 'data',
    description: ''
  },

  // AI 分类
  {
    id: 'agent',
    name: 'agent',
    icon: <Brain />,
    category: NodeCategory.AI,
    section: 'ai',
    description: ''
  },
  {
    id: 'llm',
    name: 'llm',
    icon: <CircuitBoard />,
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
    id: 'webhook',
    name: 'webhook',
    icon: <WebhookIcon />,
    category: NodeCategory.CORE,
    section: 'triggers',
    description: ''
  },
  {
    id: 'schedule',
    name: 'schedule',
    icon: <Timer />,
    category: NodeCategory.CORE,
    section: 'triggers',
    description: ''
  },
  {
    id: 'http-request',
    name: 'http-request',
    icon: <Send />,
    category: NodeCategory.CORE,
    section: 'network',
    description: ''
  },
  {
    id: 'knowledge-retrieval',
    name: 'knowledge-retrieval',
    icon: <Search />,
    category: NodeCategory.CORE,
    section: 'knowledge',
    description: ''
  }
];