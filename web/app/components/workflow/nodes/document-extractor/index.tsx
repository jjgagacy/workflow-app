import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS } from "./data";
import type { DocumentExtractorNodeData } from "./types";

const DocumentExtractorNode = ({ id, data }: NodeProps<Node<DocumentExtractorNodeData>>) => {
  const label = data.label?.trim() || 'Document Extractor';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputVariable = data.inputVariable?.trim();
  const outputVariableName = data.outputVariableName?.trim() || 'documentText';

  return (
    <div className="document-extractor-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">
                  输入 {inputVariable || '未选择'}
                </span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  输出 {outputVariableName}
                </span>
              </div>
              <div className="mt-2 line-clamp-2">
                支持 {DOCUMENT_EXTRACTOR_SUPPORTED_FORMATS.join(' / ')}
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default DocumentExtractorNode;
