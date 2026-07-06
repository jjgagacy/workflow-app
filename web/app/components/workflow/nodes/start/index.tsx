import { NodeProps } from "@xyflow/react";
import { StartNodeData } from "./type";
import type { Node } from "../../types";
import { NodeHeader } from "../../components/nodes-shared";
import { useTranslation } from "react-i18next";
import { getNodeTypeIconColor } from "../../utils/node";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { FileText, ListChecks } from "lucide-react";

const StartNode = ({ id, data }: NodeProps<Node<StartNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.start.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const variables = data.formVariables ?? [];
  const requiredCount = variables.filter((item) => item.required).length;

  return (
    <div className="start-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-muted/20 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5" />
                  <span>{variables.length} {variables.length === 1 ? 'field' : 'fields'}</span>
                </span>
                <span className="text-muted-foreground/40">|</span>
                <span>{requiredCount} required</span>
              </div>
              <div className="mt-2 space-y-1">
                {variables.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-background px-2 py-1">
                    <span className="truncate text-foreground">{item.label || item.name}</span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                ))}
                {variables.length > 2 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>+{variables.length - 2} more</span>
                  </div>
                )}
                {variables.length === 0 && (
                  <div className="text-muted-foreground/70">No form variables configured</div>
                )}
              </div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
}

export default StartNode;