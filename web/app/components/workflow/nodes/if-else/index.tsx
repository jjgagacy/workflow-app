import { NodeProps } from "@xyflow/react";
import { IfElseNodeData } from "./types";
import { Node } from "../../types";

const IfElseNode = ({ id, type, data }: NodeProps<Node<IfElseNodeData>>) => {
  console.log("Rendering IfElseNode with data:", id, type, data);
  return (
    <div className="if-else-node">
      <div className="node-header">If-Else Node</div>
      <div className="node-content">
        {/* Render node content based on data */}
      </div>
    </div>
  );
}

export default IfElseNode;