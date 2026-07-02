import { NodeProps } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { DocumentExtractorNodeData } from "./types";
import { DEFAULT_OUTPUT_VARIABLE_NAME } from "./data";

const DocumentExtractorNode = ({ id, data }: NodeProps<Node<DocumentExtractorNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.document-extractor.name') || 'Document Extractor';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputVariable = data.inputVariable?.trim();
  const outputVariableName = data.outputVariableName?.trim() || DEFAULT_OUTPUT_VARIABLE_NAME;

  return (
    <div className="document-extractor-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">输入</span>
                <span className="font-mono text-foreground truncate max-w-[120px]">
                  {inputVariable || t('workflow.nodes.document-extractor.no-input')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">输出</span>
                <span className="font-mono text-foreground truncate max-w-[120px]">
                  {outputVariableName}
                </span>
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