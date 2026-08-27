import { NodeProps } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { NodeTargetHandle } from "../../components/handle/node-target-handle";
import { NodeHeader } from "../../components/nodes-shared";
import { getNodeTypeIcon } from "../../data";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import type { EndNodeType } from "./type";

const EndNode = ({ id, data }: NodeProps<Node<EndNodeType>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t("workflow.nodes.end.name");
  const iconColor = getNodeTypeIconColor(data.type);
  const outputs = data.outputs ?? [];

  return (
    <div className="end-node relative">
      <NodeHeader icon={getNodeTypeIcon(data.type, "h-4 w-4")} iconColor={iconColor} title={label} />
      {!data._candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span>{t("workflow.nodes.end.output") || "输出变量"}</span>
                <span className="font-medium text-foreground">{outputs.length}</span>
              </div>

              <div className="space-y-1">
                {outputs.length === 0 ? (
                  <div className="text-muted-foreground/70">No outputs configured</div>
                ) : (
                  outputs.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-background px-2 py-1">
                      <span className="truncate text-foreground">{item.name || "Unnamed output"}</span>
                    </div>
                  ))
                )}
                {outputs.length > 2 && (
                  <div className="text-muted-foreground/70">+{outputs.length - 2} more</div>
                )}
              </div>
            </div>
          </div>
          <NodeTargetHandle nodeId={id} handleId="target" className="top-1/2 -translate-y-1/2" />
        </>
      )}
    </div>
  );
};

export default EndNode;