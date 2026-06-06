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

export const CUSTOM_NODE_NAME = 'customNode';
export const CUSTOM_EDGE_NAME = 'customEdge';

export const CUSTOM_NOTE_NODE_NAME = 'customNoteNode';
export const CUSTOM_SIMPLE_NODE_NAME = 'customSimpleNode';

export const NODE_RESIZE_MIN_WIDTH = 200;
export const NODE_RESIZE_MIN_HEIGHT = 90;

export const NODE_DEFAULT_WIDTH = 200;
export const NODE_DEFAULT_HEIGHT = 88;

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
};