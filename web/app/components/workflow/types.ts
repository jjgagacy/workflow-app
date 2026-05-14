import { Node as ReactFlowNode, Edge as ReactFlowEdge, XYPosition, Dimensions } from "@xyflow/react";

export enum NodeType {
  Base = 'base',
  Start = 'start',
  End = 'end',
  Answer = 'answer',
  LLM = 'llm',
  KnowledgeRetrieval = 'knowledge-retrieval',
  QuestionClassifier = 'question-classifier',
  IfElse = 'if-else',
  Code = 'code',
  TemplateTransform = 'template-transform',
  HttpRequest = 'http-request',
  VariableAssigner = 'variable-assigner',
  VariableAggregator = 'variable-aggregator',
  ParameterExtractor = 'parameter-extractor',
  Iteration = 'iteration',
  DocExtractor = 'document-extractor',
  ListFilter = 'list-operator',
  IterationStart = 'iteration-start',
  Agent = 'agent',
  Loop = 'loop',
  LoopStart = 'loop-start',
  LoopEnd = 'loop-end',
}

export type NodeData<T> = {
  label?: string;
  value?: any;
  description?: string;
  type: NodeType;
  selected?: boolean;
  size?: Dimensions;
  position?: XYPosition;
} & T;

export type Node<T = {}> = ReactFlowNode<NodeData<T>>;

export type Edge<T = {}> = ReactFlowEdge<{
  sourceType: NodeType;
  targetType: NodeType;
} & T>;

