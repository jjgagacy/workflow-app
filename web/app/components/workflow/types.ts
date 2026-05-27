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

export type NodeData<T = {}> = {
  label?: string;
  value?: any;
  description?: string;
  type: NodeType;
  // selected?: boolean;
  size?: Dimensions;
  position?: XYPosition;
  candidate?: boolean;
  icon?: React.ReactNode;
} & T;

export type Node<T = {}> = ReactFlowNode<NodeData<T>>;

export type Edge<T = {}> = ReactFlowEdge<{
  sourceType: NodeType;
  targetType: NodeType;
} & T>;

export enum NodeCategory {
  FLOW = 'flow',
  TOOLS = 'tools',
  AI = 'ai',
  CORE = 'core'
}

export type NodeCategoryType =
  NodeCategory.FLOW |
  NodeCategory.TOOLS |
  NodeCategory.AI |
  NodeCategory.CORE;

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

export type NodeCategoryFlowProps = {

}

export type NodeCategoryToolsProps = {
  provider: string;
  tool: string;
  providerName: string;
  toolName: string;
  label: string;
  params: Record<string, any>;
  paramSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export type NodeCategoryAIProps = {

}

export type NodeCategoryCoreProps = {

}

export type NodeCategoryProps =
  NodeCategoryFlowProps |
  NodeCategoryToolsProps |
  NodeCategoryAIProps |
  NodeCategoryCoreProps;
