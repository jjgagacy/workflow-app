import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { DEFAULT_LIST_OPERATOR_OUTPUT_VARIABLE_NAME } from "./data";
import type { ListOperatorNodeData } from "./types";
import { useTranslation } from "react-i18next";

const ListOperatorNode = ({ id, data }: NodeProps<Node<ListOperatorNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.list-operator.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputVariable = data.inputVariable?.trim() || t('workflow.nodes.list-operator.no-input-variable');
  const outputVariableName = data.outputVariableName?.trim() || DEFAULT_LIST_OPERATOR_OUTPUT_VARIABLE_NAME;

  return (
    <div className="list-operator-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-2 space-y-1.5">
              <div className="flex flex-col gap-2 text-xs">
                <span className="flex items-center justify-between  gap-1 text-muted-foreground">
                  <span>{t('workflow.nodes.list-operator.input')}</span>
                  <span className="font-mono text-foreground">{inputVariable}</span>
                </span>
                <span className="flex items-center justify-between  gap-1 text-muted-foreground">
                  <span>{t('workflow.nodes.list-operator.output')}</span>
                  <span className="font-mono text-foreground">{outputVariableName}</span>
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

export default ListOperatorNode;
