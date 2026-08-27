import type { Node as ReactFlowNode } from "@xyflow/react";
import { Node, NodeType } from "./types";
import { startNodeDefaultData } from "./nodes/start/data";
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
import { webhookNodeDefaultData } from "./nodes/webhook/data";
import { scheduleNodeDefaultData } from "./nodes/schedule/data";

export const initialNodes: Node[] = [];

export const isStartNodeType = (nodeType: NodeType) => {
  return nodeType === NodeType.Start || nodeType === NodeType.Webhook || nodeType === NodeType.Schedule;
};

export const isStartNode = (node: Node | ReactFlowNode) => {
  return isStartNodeType(node.data?.type as NodeType);
};

export const isLoopNodeType = (nodeType: NodeType) => {
  return nodeType === NodeType.LoopStart;
};

export const isIterationNodeType = (nodeType: NodeType) => {
  return nodeType === NodeType.IterationStart;
};

type NodeBehavior = {
  validate: (data: any, t: any, nodeOtherData: any) => { valid: boolean; errorMessage?: string;[key: string]: any };
};

const noopValidate = () => ({ valid: true });

export const NODE_BEHAVIORS: Record<NodeType, NodeBehavior> = {
  [NodeType.Base]: { validate: noopValidate },
  [NodeType.Start]: { validate: startNodeDefaultData.validate },
  [NodeType.End]: { validate: noopValidate },
  [NodeType.Answer]: { validate: noopValidate },
  [NodeType.LLM]: { validate: llmNodeDefaultData.validate },
  [NodeType.KnowledgeRetrieval]: { validate: knowledgeRetrievalNodeDefaultData.validate },
  [NodeType.QuestionClassifier]: { validate: questionClassifierNodeDefaultData.validate },
  [NodeType.IfElse]: { validate: ifElseNodeDefaultData.validate },
  [NodeType.Code]: { validate: codeNodeDefaultData.validate },
  [NodeType.TemplateTransform]: { validate: noopValidate },
  [NodeType.HttpRequest]: { validate: httpRequestNodeDefaultData.validate },
  [NodeType.VariableAssigner]: { validate: noopValidate },
  [NodeType.VariableAggregator]: { validate: variableAggregatorNodeDefaultData.validate },
  [NodeType.ParameterExtractor]: { validate: parameterExtractorNodeDefaultData.validate },
  [NodeType.Iteration]: { validate: noopValidate },
  [NodeType.Filter]: { validate: filterNodeDefaultData.validate },
  [NodeType.DocExtractor]: { validate: documentExtractorNodeDefaultData.validate },
  [NodeType.ListOperator]: { validate: listOperatorNodeDefaultData.validate },
  [NodeType.IterationStart]: { validate: noopValidate },
  [NodeType.Agent]: { validate: noopValidate },
  [NodeType.Loop]: { validate: noopValidate },
  [NodeType.LoopStart]: { validate: noopValidate },
  [NodeType.LoopEnd]: { validate: noopValidate },
  [NodeType.Webhook]: { validate: webhookNodeDefaultData.validate },
  [NodeType.Schedule]: { validate: scheduleNodeDefaultData.validate },
};