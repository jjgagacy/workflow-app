import { getNodeTypeIcon } from "../../data";
import { NodeType, VariableSelector } from "../../types"
import { getNodeTypeIconColor } from "../../utils/node";
import { VariableGroupType } from "./var-functions";
import { VariableIcon } from "./var-icon";

type VariableIconNodeProps = {
  nodeType: NodeType;
  nodeTitle?: string;
}

export const VariableIconNode = ({
  nodeType,
  nodeTitle
}: VariableIconNodeProps) => {
  const nodeIconClass = getNodeTypeIconColor(nodeType);
  return (
    <>
      {getNodeTypeIcon(nodeType, `shrink-0 text-text-secondary h-4 w-4 ${nodeIconClass}`)}
      {
        nodeTitle && (
          <div
            className="max-w-[60px] truncate text-text-secondary"
            title={nodeTitle}
          >
            {nodeTitle}
          </div>
        )
      }
      <div className="text-text-secondary">/</div>
    </>
  )
};