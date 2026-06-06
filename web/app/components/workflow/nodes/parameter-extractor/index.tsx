import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getWorkflowModelById } from "../../components/nodes-shared/model-options";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { normalizeParameterExtractorItems } from "./data";
import type { ParameterExtractorNodeData } from "./types";

const ParameterExtractorNode = ({ id, data }: NodeProps<Node<ParameterExtractorNodeData>>) => {
  const label = data.label?.trim() || 'Parameter Extractor';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const model = getWorkflowModelById(data.modelId);
  const modelLabel = model ? `${model.provider} / ${model.name}` : '未选择模型';
  const enableVision = Boolean(data.enableVision);
  const parameters = normalizeParameterExtractorItems(data.parameters);
  const invalidDescriptionCount = parameters.filter((item) => !item.description?.trim()).length;
  const outputVariableName = data.outputVariableName?.trim() || 'extractedParameters';

  return (
    <div className="parameter-extractor-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">{modelLabel}</span>
                <span className="rounded-full bg-background px-2.5 py-1">参数 {parameters.length}</span>
                <span className="rounded-full bg-background px-2.5 py-1">{enableVision ? '视觉已启用' : '视觉未启用'}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">输出 {outputVariableName}</span>
                {invalidDescriptionCount > 0 && (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
                    缺少描述 {invalidDescriptionCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default ParameterExtractorNode;
