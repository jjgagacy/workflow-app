import { Position } from "@xyflow/react";
import { CUSTOM_NODE_NAME, CUSTOM_SIMPLE_NODE_NAME } from "../constants";
import { Node, NodeCatalog, NodeType } from "../types";

const CATALOG_NODE_TYPE_MAP: Record<string, NodeType> = {
  base: NodeType.Base,
  if: NodeType.IfElse,
  iteration: NodeType.Iteration,
  loop: NodeType.Loop,
  filter: NodeType.ListFilter,
  code: NodeType.Code,
  'template-transform': NodeType.TemplateTransform,
  'variable-assigner': NodeType.VariableAssigner,
  'variable-aggregator': NodeType.VariableAggregator,
  'parameter-extractor': NodeType.ParameterExtractor,
  'question-classifier': NodeType.QuestionClassifier,
  'document-extractor': NodeType.DocExtractor,
  'list-operator': NodeType.ListFilter,
  agent: NodeType.Agent,
  llm: NodeType.LLM,
  'http-request': NodeType.HttpRequest,
  'knowledge-retrieval': NodeType.KnowledgeRetrieval,
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