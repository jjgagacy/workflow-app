import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { KNOWLEDGE_BASE_OPTIONS, normalizeKnowledgeBaseSelections } from "./data";
import type { KnowledgeRetrievalNodeData } from "./types";

const KnowledgeRetrievalNode = ({ id, data }: NodeProps<Node<KnowledgeRetrievalNodeData>>) => {
  const label = data.label?.trim() || 'Knowledge Retrieval';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputVariable = data.inputVariable?.trim() || '未选择输入变量';
  const selections = normalizeKnowledgeBaseSelections(data.knowledgeBases);
  const selectedNames = selections
    .map((selection) => KNOWLEDGE_BASE_OPTIONS.find((option) => option.id === selection.knowledgeBaseId)?.name || selection.knowledgeBaseId)
    .filter(Boolean);
  const outputVariableName = data.outputVariableName?.trim() || 'knowledgeResults';

  return (
    <div className="knowledge-retrieval-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">输入 {inputVariable}</span>
                <span className="rounded-full bg-background px-2.5 py-1">知识库 {selectedNames.length}</span>
                <span className="rounded-full bg-background px-2.5 py-1">输出 {outputVariableName}</span>
              </div>
              <div className="mt-2 line-clamp-2">{selectedNames.join(' / ') || '未选择知识库'}</div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default KnowledgeRetrievalNode;
