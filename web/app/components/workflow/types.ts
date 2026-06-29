import { Node as ReactFlowNode, Edge as ReactFlowEdge, XYPosition, Dimensions } from "@xyflow/react";
import { ComparisonOperator, OperatorType } from "./nodes/if-else/types";

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
  Filter = 'filter',
  DocExtractor = 'document-extractor',
  ListOperator = 'list-operator',
  IterationStart = 'iteration-start',
  Agent = 'agent',
  Loop = 'loop',
  LoopStart = 'loop-start',
  LoopEnd = 'loop-end',
}

export type NodeData<T = {}> = {
  type: NodeType;

  label?: string;
  value?: any;
  description?: string;
  disabled?: boolean;
  // selected?: boolean;

  size?: Dimensions;
  position?: XYPosition;
  candidate?: boolean;
  icon?: React.ReactNode;
  iconColor?: string;
} & T;

export type Node<T = {}> = ReactFlowNode<NodeData<T>>;

export type Edge<T = {}> = ReactFlowEdge<{
  hovering?: boolean;
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

export enum VariableDataType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  array = 'array',
  object = 'object',
  file = 'file',
  any = 'any'
}

export enum ValueSourceMode {
  variable = 'variable',
  constant = 'constant',
  custom = 'custom',
}

export type CodeInputValueSourceType = 'input' | 'env' | 'session' | 'node-output' | 'system';

export type Variable = {
  id: string;
  name: string;

  sourceType: ValueSourceMode; // 这个变量的值是“怎么来的”（引用、常量、自定义）
  dataType?: VariableDataType; // 这个变量的物理数据结构是什么（string, number, file）

  label?: string;
  valueSelector?: string[]; // 当 sourceMode === 'variable' 时，用来追踪上游节点路径的 Selector
  value?: string;           // 当 sourceMode === 'constant' 或 'custom' 时的具象值

  options?: { label: string; value: string }[];
  required?: boolean;
  valueSourceType?: CodeInputValueSourceType;
  valueSource?: string;

  customType?: string;
}

export type ParameterType = string | number | boolean | undefined | null;

export interface Operator extends ComparisonOperator {
  name: string; // e.g. "equals", "not equals", "greater than", "less than", "contains", "does not contain", "matches regex", "does not match regex", "is empty", "is not empty"
}

export interface OperatorGroup {
  id: string;
  label: OperatorType; // label: "string", "number", "boolean", "array", "object", "datetime", "file", "any"
  operators: Operator[];
  icon?: React.ReactNode;
}

export type NodeDefaultData<T> = {
  value: Partial<T>;
  runInputData?: Record<string, any>;
}

export type NodeAddParams = (params: {
  nodeType: NodeType;
  renderType?: string;

  label?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;

  nodeId?: string;
  parentNodeId?: string;
  sourceHandle?: string;
  targetHandle?: string;

  previousNodeId?: string;
  previousNodeSourceHandle?: string;

  nextNodeId?: string;
  nextNodeTargetHandle?: string;
}) => void;

export enum CodeLanguage {
  python = 'python',
  javascript = 'javascript',
}
