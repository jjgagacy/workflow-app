import { useAvailableNodes } from "../hooks/use-nodesData";
import { NodeListPanel } from "./panel/nodeListPanel";
import { NodeCatalog, NodeCategoryProps } from "../types";
import { getCatalogNodeIconColor, isSupportedCatalogNode, newCandidateNode, resolveCatalogNode } from "../utils/node";
import { useWorkflowStore } from "../context";

export const NodeListSelector = () => {
  const nodes = useAvailableNodes().filter(isSupportedCatalogNode);
  const setCandidateNode = useWorkflowStore(s => s.setCandidateNode);
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);

  const handleNode = (node: NodeCatalog, _props?: NodeCategoryProps) => {
    const resolvedNode = resolveCatalogNode(node);

    if (!resolvedNode) {
      return;
    }

    const newNode = newCandidateNode({
      type: resolvedNode.renderType,
      data: {
        type: resolvedNode.nodeType,
        label: node.name,
        description: node.description,
        candidate: true,
        icon: node.icon,
        iconColor: getCatalogNodeIconColor(node),
      },
      position: {
        x: 0,
        y: 0
      }
    });

    setCandidateNode(newNode);
    setShowNodeSelector(false);
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 z-50 w-80 bg-background border-l border-[var(--border)]">
      <NodeListPanel nodes={nodes} onSelectNode={handleNode} />
    </div>
  );
}