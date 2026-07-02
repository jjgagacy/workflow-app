import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { KNOWLEDGE_OUTPUT_VARIABLE_NAME } from "./data";
import type { KnowledgeRetrievalNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { useKnowledgeRetrieval } from "./hooks";

const KnowledgeRetrievalNode = ({ id, data }: NodeProps<Node<KnowledgeRetrievalNodeData>>) => {
  const { t } = useTranslation();
  const { normalizeKnowledgeBaseSelections, knowledgeBaseOptions } = useKnowledgeRetrieval();
  const label = data.label?.trim() || t('workflow.nodes.knowledgeRetrieval.label');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputVariable = data.inputVariable?.trim() || t('workflow.nodes.knowledge-retrieval.noInputVariable');
  const selections = normalizeKnowledgeBaseSelections(data.knowledgeBases);
  const selectedNames = selections
    .map((selection) => knowledgeBaseOptions.find((option) => option.id === selection.knowledgeBaseId)?.name || selection.knowledgeBaseId)
    .filter(Boolean);
  const outputVariableName = data.outputVariableName?.trim() || KNOWLEDGE_OUTPUT_VARIABLE_NAME;

  return (
    <div className="knowledge-retrieval-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">{t('workflow.nodes.knowledge-retrieval.input')} {inputVariable}</span>
                <span className="rounded-full bg-background px-2.5 py-1">{t('workflow.nodes.knowledge-retrieval.knowledgeBases')} {selectedNames.length}</span>
                <span className="rounded-full bg-background px-2.5 py-1">{t('workflow.nodes.knowledge-retrieval.output')} {outputVariableName}</span>
              </div>
              <div className="mt-2 line-clamp-2">{selectedNames.join(' / ') || t('workflow.nodes.knowledge-retrieval.noKnowledgeBase')}</div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default KnowledgeRetrievalNode;
