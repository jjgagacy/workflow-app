import { NodeType } from "../../types";

type VarNodeProps = {
  nodeType?: NodeType;
  nodeTitle?: string;
}

export const VarNode = ({
  nodeType,
  nodeTitle
}: VarNodeProps) => {
  return (
    <>
      <div className="flex items-center space-x-1">
        {nodeTitle && (
          <div
            className="max-w-[60px] truncate text-text-secondary"
            title={nodeTitle}
          >
            {nodeTitle}
          </div>
        )}
        <div className="text-text-secondary">/</div>
      </div>
    </>
  )
}