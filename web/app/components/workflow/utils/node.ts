import { Position } from "@xyflow/react";
import { CUSTOM_NODE_NAME, CUSTOM_SIMPLE_NODE_NAME } from "../constants";
import { Node, NodeCatalog, NodeCategory, NodeType } from "../types";

const CATALOG_NODE_TYPE_MAP: Record<string, NodeType> = {
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
};

const ICON_COLORS = {
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

const NODE_TYPE_ICON_COLOR_MAP: Partial<Record<NodeType, string>> = {
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
};

export type ResolvedCatalogNode = {
  nodeType: NodeType;
  renderType: string;
};

export function newCandidateNode({ data, position, id, zIndex, type, ...rest }: Omit<Node, 'id'> & { id?: string }) {
  const node: Node = {
    id: id || `node-${Date.now()}`,
    type: type || CUSTOM_NODE_NAME,
    data,
    position,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    zIndex: zIndex || 0,
    ...rest,
  };

  return node;
}

export const isTargetInputArea = (target: HTMLElement) => {
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]'),
  );
}

export const getCustomeNodeType = (node: Node) => {
  if (node.data.type === NodeType.LoopEnd) {
    return CUSTOM_SIMPLE_NODE_NAME;
  }
  return CUSTOM_NODE_NAME;
}

export const resolveCatalogNode = (node: Pick<NodeCatalog, 'id'>): ResolvedCatalogNode | null => {
  const nodeType = CATALOG_NODE_TYPE_MAP[node.id];

  if (!nodeType) {
    return null;
  }

  return {
    nodeType,
    renderType: getCustomeNodeType({ data: { type: nodeType } } as Node),
  };
};

export const isSupportedCatalogNode = (node: Pick<NodeCatalog, 'id'>) => {
  return resolveCatalogNode(node) !== null;
};

export const getCatalogNodeIconColor = (node: Pick<NodeCatalog, 'id' | 'category' | 'section'>) => {
  const resolvedNode = resolveCatalogNode(node);

  if (resolvedNode) {
    return getNodeTypeIconColor(resolvedNode.nodeType);
  }

  if (node.category === NodeCategory.AI) {
    return ICON_COLORS.ai;
  }

  if (node.category === NodeCategory.TOOLS) {
    if (node.section === 'communication') {
      return ICON_COLORS.communication;
    }

    if (node.section === 'development') {
      return ICON_COLORS.development;
    }

    return ICON_COLORS.productivity;
  }

  if (node.category === NodeCategory.CORE) {
    if (node.section === 'triggers') {
      return ICON_COLORS.trigger;
    }

    if (node.section === 'network') {
      return ICON_COLORS.network;
    }

    return ICON_COLORS.knowledge;
  }

  if (node.section === 'flow-control') {
    return ICON_COLORS.flow;
  }

  if (node.section === 'data') {
    return ICON_COLORS.data;
  }

  return ICON_COLORS.neutral;
};

export const getNodeTypeIconColor = (nodeType?: NodeType) => {
  if (!nodeType) {
    return ICON_COLORS.neutral;
  }

  return NODE_TYPE_ICON_COLOR_MAP[nodeType] || ICON_COLORS.neutral;
};