import { ifElseNodeDefaultData } from "./nodes/if-else/data";
import { filterNodeDefaultData } from "./nodes/filter/data";
import { codeNodeDefaultData } from "./nodes/code/data";
import { variableAggregatorNodeDefaultData } from "./nodes/variable-aggregator/data";
import { questionClassifierNodeDefaultData } from "./nodes/question-classifier/data";
import { documentExtractorNodeDefaultData } from "./nodes/document-extractor/data";
import { llmNodeDefaultData } from "./nodes/llm/data";
import { parameterExtractorNodeDefaultData } from "./nodes/parameter-extractor/data";
import { listOperatorNodeDefaultData } from "./nodes/list-operator/data";
import { knowledgeRetrievalNodeDefaultData } from "./nodes/knowledge-retrieval/data";
import { httpRequestNodeDefaultData } from "./nodes/http-request/data";
import type { IfElseNodeData } from "./nodes/if-else/types";
import type { FilterNodeData } from "./nodes/filter/types";
import type { IterationNodeData } from "./nodes/iteration/types";
import type { CodeNodeData } from "./nodes/code/types";
import type { VariableAggregatorNodeData } from "./nodes/variable-aggregator/types";
import type { QuestionClassifierNodeData } from "./nodes/question-classifier/types";
import type { DocumentExtractorNodeData } from "./nodes/document-extractor/types";
import type { LLMNodeData } from "./nodes/llm/types";
import type { ParameterExtractorNodeData } from "./nodes/parameter-extractor/types";
import type { ListOperatorNodeData } from "./nodes/list-operator/types";
import type { KnowledgeRetrievalNodeData } from "./nodes/knowledge-retrieval/types";
import type { HttpRequestNodeData } from "./nodes/http-request/types";
import type { NodeData } from "./types";
import { NodeType } from "./types";
import { webhookNodeDefaultData } from "./nodes/webhook/data";

export const CUSTOM_NODE_NAME = 'customNode';
export const CUSTOM_EDGE_NAME = 'customEdge';

export const CUSTOM_NOTE_NODE_NAME = 'customNoteNode';
export const CUSTOM_SIMPLE_NODE_NAME = 'customSimpleNode';

export const NODE_RESIZE_MIN_WIDTH = 200;
export const NODE_RESIZE_MIN_HEIGHT = 90;

export const NODE_DEFAULT_WIDTH = 200;
export const NODE_DEFAULT_HEIGHT = 88;

export const DEFAULT_MAX_FILE_UPLOAD_COUNT = 5;

type NodeDefaultDataByType = Partial<Record<NodeType, Partial<NodeData>>> & {
  [NodeType.IfElse]: Partial<IfElseNodeData>;
  [NodeType.Filter]: Partial<FilterNodeData>;
  [NodeType.Iteration]: Partial<IterationNodeData>;
  [NodeType.Code]: Partial<CodeNodeData>;
  [NodeType.VariableAggregator]: Partial<VariableAggregatorNodeData>;
  [NodeType.QuestionClassifier]: Partial<QuestionClassifierNodeData>;
  [NodeType.DocExtractor]: Partial<DocumentExtractorNodeData>;
  [NodeType.LLM]: Partial<LLMNodeData>;
  [NodeType.ParameterExtractor]: Partial<ParameterExtractorNodeData>;
  [NodeType.ListOperator]: Partial<ListOperatorNodeData>;
  [NodeType.KnowledgeRetrieval]: Partial<KnowledgeRetrievalNodeData>;
  [NodeType.HttpRequest]: Partial<HttpRequestNodeData>;
};

export const NODE_DEFAULT_DATA: NodeDefaultDataByType = {
  [NodeType.IfElse]: {
    type: NodeType.IfElse,
    label: '',
    ...ifElseNodeDefaultData.value,
  },
  [NodeType.Filter]: {
    type: NodeType.Filter,
    label: '',
    ...filterNodeDefaultData.value,
  },
  [NodeType.Iteration]: {
    type: NodeType.Iteration,
    label: '',
    parallelCount: 1,
    errorResponse: 'stop-workflow',
    flat: false,
    size: {
      width: 320,
      height: 220,
    },
  },
  [NodeType.Code]: {
    type: NodeType.Code,
    label: '',
    ...codeNodeDefaultData.value,
  },
  [NodeType.VariableAggregator]: {
    type: NodeType.VariableAggregator,
    label: '',
    ...variableAggregatorNodeDefaultData.value,
  },
  [NodeType.QuestionClassifier]: {
    type: NodeType.QuestionClassifier,
    label: '',
    ...questionClassifierNodeDefaultData.value,
  },
  [NodeType.DocExtractor]: {
    type: NodeType.DocExtractor,
    label: '',
    ...documentExtractorNodeDefaultData.value,
  },
  [NodeType.LLM]: {
    type: NodeType.LLM,
    label: '',
    ...llmNodeDefaultData.value,
  },
  [NodeType.ParameterExtractor]: {
    type: NodeType.ParameterExtractor,
    label: '',
    ...parameterExtractorNodeDefaultData.value,
  },
  [NodeType.ListOperator]: {
    type: NodeType.ListOperator,
    label: '',
    ...listOperatorNodeDefaultData.value,
  },
  [NodeType.KnowledgeRetrieval]: {
    type: NodeType.KnowledgeRetrieval,
    label: '',
    ...knowledgeRetrievalNodeDefaultData.value,
  },
  [NodeType.HttpRequest]: {
    type: NodeType.HttpRequest,
    label: '',
    ...httpRequestNodeDefaultData.value,
  },
  [NodeType.Webhook]: {
    type: NodeType.Webhook,
    label: '',
    ...webhookNodeDefaultData.value,
  },
  [NodeType.Schedule]: {
    type: NodeType.Schedule,
    label: '',
  }
};

export const NODE_PANEL_DEFAULT_WIDTH = 410;

export const CATALOG_NODE_TYPE_MAP: Record<string, NodeType> = {
  base: NodeType.Base,
  if: NodeType.IfElse,
  iteration: NodeType.Iteration,
  loop: NodeType.Loop,
  filter: NodeType.Filter,
  code: NodeType.Code,
  'template-transform': NodeType.TemplateTransform,
  'variable-assigner': NodeType.VariableAssigner,
  'variable-aggregator': NodeType.VariableAggregator,
  'parameter-extractor': NodeType.ParameterExtractor,
  'question-classifier': NodeType.QuestionClassifier,
  'document-extractor': NodeType.DocExtractor,
  'list-operator': NodeType.ListOperator,
  agent: NodeType.Agent,
  llm: NodeType.LLM,
  'http-request': NodeType.HttpRequest,
  'knowledge-retrieval': NodeType.KnowledgeRetrieval,
  'start': NodeType.Start,
  'webhook': NodeType.Webhook,
  'schedule': NodeType.Schedule,
};

export const ICON_COLORS = {
  neutral: "text-indigo-600 dark:text-indigo-400",
  flow: "text-violet-600 dark:text-violet-400",
  data: "text-cyan-600 dark:text-cyan-400",
  ai: "text-fuchsia-600 dark:text-fuchsia-400",
  logic: "text-purple-600 dark:text-purple-400",
  transform: "text-sky-600 dark:text-sky-400",
  variables: "text-blue-600 dark:text-blue-400",
  analysis: "text-lime-600 dark:text-lime-400",
  communication: "text-emerald-600 dark:text-emerald-400",
  development: "text-rose-600 dark:text-rose-400",
  productivity: "text-orange-600 dark:text-orange-400",
  trigger: "text-amber-600 dark:text-amber-400",
  network: "text-teal-600 dark:text-teal-400",
  knowledge: "text-blue-600 dark:text-blue-400",
} as const;


export const NODE_TYPE_ICON_COLOR_MAP: Partial<Record<NodeType, string>> = {
  [NodeType.Base]: ICON_COLORS.neutral,
  [NodeType.IfElse]: ICON_COLORS.logic,
  [NodeType.Iteration]: ICON_COLORS.flow,
  [NodeType.Loop]: ICON_COLORS.flow,
  [NodeType.Code]: ICON_COLORS.data,
  [NodeType.TemplateTransform]: ICON_COLORS.transform,
  [NodeType.VariableAssigner]: ICON_COLORS.variables,
  [NodeType.VariableAggregator]: ICON_COLORS.variables,
  [NodeType.ParameterExtractor]: ICON_COLORS.analysis,
  [NodeType.QuestionClassifier]: ICON_COLORS.analysis,
  [NodeType.Filter]: ICON_COLORS.data,
  [NodeType.DocExtractor]: ICON_COLORS.transform,
  [NodeType.ListOperator]: ICON_COLORS.data,
  [NodeType.Agent]: ICON_COLORS.ai,
  [NodeType.LLM]: ICON_COLORS.ai,
  [NodeType.HttpRequest]: ICON_COLORS.network,
  [NodeType.KnowledgeRetrieval]: ICON_COLORS.knowledge,
  [NodeType.Start]: ICON_COLORS.trigger,
};

