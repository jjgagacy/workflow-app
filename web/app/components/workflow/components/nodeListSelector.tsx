import { useAvailableNodes } from "../hooks/use-nodesData";
import { NODES_DATA } from "../nodes/data";
import { NodeListPanel } from "./panel/nodeListPanel";

export const NodeListSelector = () => {
  const nodes = useAvailableNodes();
  return (
    <div className="absolute right-0 top-0 bottom-0 z-50 w-80 bg-background border-l border-[var(--border)]">
      <NodeListPanel nodes={nodes} />
    </div>
  );
}