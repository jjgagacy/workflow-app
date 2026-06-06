import IfElseNode from "./if-else";
import IfElsePanel from "./if-else/panel";
import FilterNode from "./filter";
import FilterPanel from "./filter/panel";
import IterationNode from "./iteration";
import IterationPanel from "./iteration/panel";
import CodeNode from "./code";
import CodePanel from "./code/panel";
import VariableAggregatorNode from "./variable-aggregator";
import VariableAggregatorPanel from "./variable-aggregator/panel";
import QuestionClassifierNode from "./question-classifier";
import QuestionClassifierPanel from "./question-classifier/panel";
import DocumentExtractorNode from "./document-extractor";
import DocumentExtractorPanel from "./document-extractor/panel";
import LLMNode from "./llm";
import LLMPanel from "./llm/panel";
import ParameterExtractorNode from "./parameter-extractor";
import ParameterExtractorPanel from "./parameter-extractor/panel";
import ListOperatorNode from "./list-operator";
import ListOperatorPanel from "./list-operator/panel";
import KnowledgeRetrievalNode from "./knowledge-retrieval";
import KnowledgeRetrievalPanel from "./knowledge-retrieval/panel";
import HttpRequestNode from "./http-request";
import HttpRequestPanel from "./http-request/panel";

export const NodeComponents: Record<string, React.FC<any>> = {
  iteration: IterationNode,
  'if-else': IfElseNode,
  filter: FilterNode,
  code: CodeNode,
  'variable-aggregator': VariableAggregatorNode,
  'question-classifier': QuestionClassifierNode,
  'document-extractor': DocumentExtractorNode,
  llm: LLMNode,
  'parameter-extractor': ParameterExtractorNode,
  'list-operator': ListOperatorNode,
  'knowledge-retrieval': KnowledgeRetrievalNode,
  'http-request': HttpRequestNode,
  // 'custom-node': CustomNode,
  // 'note-node': NoteNode,
};

export const NodePanels: Record<string, React.FC<any>> = {
  iteration: IterationPanel,
  'if-else': IfElsePanel,
  filter: FilterPanel,
  code: CodePanel,
  'variable-aggregator': VariableAggregatorPanel,
  'question-classifier': QuestionClassifierPanel,
  'document-extractor': DocumentExtractorPanel,
  llm: LLMPanel,
  'parameter-extractor': ParameterExtractorPanel,
  'list-operator': ListOperatorPanel,
  'knowledge-retrieval': KnowledgeRetrievalPanel,
  'http-request': HttpRequestPanel,
};