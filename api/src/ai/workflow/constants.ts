import { BaseNode } from "./entities/base-node.class";
import { NodeClassSignature } from "./entities/node.interface";
import { AgentNode } from "./nodes/agent/agent.node";
import { AnswerNode } from "./nodes/answer/answer.node";
import { CodeNode } from "./nodes/code/code.node";
import { DocumentExtractorNode } from "./nodes/document-extractor/document-extractor.node";
import { EndNode } from "./nodes/end/end.node";
import { FilterNode } from "./nodes/filter/filter.node";
import { HttpRequestNode } from "./nodes/http-request/http-request.node";
import { IfElseNode } from "./nodes/if-else/if-else.node";
import { IterationStartNode } from "./nodes/iteration-start/iteration-start.node";
import { IterationNode } from "./nodes/iteration/iteration.node";
import { KnowledgeRetrievalNode } from "./nodes/knowledge-retrieval/knowledge-retrieval.node";
import { ListOperatorNode } from "./nodes/list-operator/list-operator.node";
import { LLMNode } from "./nodes/llm/llm.node";
import { LoopEndNode } from "./nodes/loop-end/loop-end.node";
import { LoopStartNode } from "./nodes/loop-start/loop-start.node";
import { LoopNode } from "./nodes/loop/loop.node";
import { ParameterExtractorNode } from "./nodes/parameter-extractor/parameter-extractor.node";
import { QuestionClassifierNode } from "./nodes/question-classifier/question-classifier.node";
import { StartNode } from "./nodes/start/start.node";
import { TemplateTransformNode } from "./nodes/template-transform/template-transform.node";
import { VariableAggregatorNode } from "./nodes/variable-aggregator/variable-aggregator.node";
import { VariableAssignerNode } from "./nodes/variable-assigner/variable-assigner.node";
import { NodeType } from "./types/node-type.enum";

export const VARIABLE_SELECTOR_MIN_LENGTH = 2;
export const LATEST_VERSION = "latest";

export const NODE_TYPE_CLASS_MAPPINGS: Record<NodeType, Record<string, NodeClassSignature>> = {
  [NodeType.Start]: {
    "1": StartNode,
    [LATEST_VERSION]: StartNode,
  },
  [NodeType.End]: {
    "1": EndNode,
    [LATEST_VERSION]: EndNode,
  },
  [NodeType.Answer]: {
    "1": AnswerNode,
    [LATEST_VERSION]: AnswerNode,
  },
  [NodeType.LLM]: {
    "1": LLMNode,
    [LATEST_VERSION]: LLMNode,
  },
  [NodeType.KnowledgeRetrieval]: {
    "1": KnowledgeRetrievalNode,
    [LATEST_VERSION]: KnowledgeRetrievalNode,
  },
  [NodeType.QuestionClassifier]: {
    "1": QuestionClassifierNode,
    [LATEST_VERSION]: QuestionClassifierNode,
  },
  [NodeType.IfElse]: {
    "1": IfElseNode,
    [LATEST_VERSION]: IfElseNode,
  },
  [NodeType.Code]: {
    "1": CodeNode,
    [LATEST_VERSION]: CodeNode,
  },
  [NodeType.TemplateTransform]: {
    "1": TemplateTransformNode,
    [LATEST_VERSION]: TemplateTransformNode,
  },
  [NodeType.HttpRequest]: {
    "1": HttpRequestNode,
    [LATEST_VERSION]: HttpRequestNode,
  },
  [NodeType.VariableAssigner]: {
    "1": VariableAssignerNode,
    [LATEST_VERSION]: VariableAssignerNode,
  },
  [NodeType.VariableAggregator]: {
    "1": VariableAggregatorNode,
    [LATEST_VERSION]: VariableAggregatorNode,
  },
  [NodeType.ParameterExtractor]: {
    "1": ParameterExtractorNode,
    [LATEST_VERSION]: ParameterExtractorNode,
  },
  [NodeType.Iteration]: {
    "1": IterationNode,
    [LATEST_VERSION]: IterationNode,
  },
  [NodeType.Filter]: {
    "1": FilterNode,
    [LATEST_VERSION]: FilterNode,
  },
  [NodeType.DocumentExtractor]: {
    "1": DocumentExtractorNode,
    [LATEST_VERSION]: DocumentExtractorNode,
  },
  [NodeType.ListOperator]: {
    "1": ListOperatorNode,
    [LATEST_VERSION]: ListOperatorNode,
  },
  [NodeType.IterationStart]: {
    "1": IterationStartNode,
    [LATEST_VERSION]: IterationStartNode,
  },
  [NodeType.Agent]: {
    "1": AgentNode,
    [LATEST_VERSION]: AgentNode,
  },
  [NodeType.Loop]: {
    "1": LoopNode,
    [LATEST_VERSION]: LoopNode,
  },
  [NodeType.LoopStart]: {
    "1": LoopStartNode,
    [LATEST_VERSION]: LoopStartNode,
  },
  [NodeType.LoopEnd]: {
    "1": LoopEndNode,
    [LATEST_VERSION]: LoopEndNode,
  }
}
