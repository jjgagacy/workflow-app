import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { VariableAggregatorNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { DEFAULT_AGGREGATOR_OUTPUT_NAME } from "./data";

const VariableAggregatorNode = ({ id, data }: NodeProps<Node<VariableAggregatorNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.variable-aggregator.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const variableCount = data.variables?.length ?? 0;
  const outputName = data.outputName?.trim() || DEFAULT_AGGREGATOR_OUTPUT_NAME;

  return (
    <div className="variable-aggregator-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{variableCount}</span>
                <span className="text-muted-foreground">{t('workflow.nodes.variable-aggregator.merged')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>{t('workflow.nodes.variable-aggregator.output')}</span>
                <span className="text-foreground font-mono">{outputName}</span>
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default VariableAggregatorNode;
