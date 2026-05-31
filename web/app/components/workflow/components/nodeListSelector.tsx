import { useAvailableNodes } from "../hooks/use-nodesData";
import { NodeListPanel } from "./panel/nodeListPanel";
import { NodeCatalog, NodeCategoryProps } from "../types";
import { getCatalogNodeIconColor, isSupportedCatalogNode, newCandidateNode, resolveCatalogNode } from "../utils/node";
import { useWorkflowStore } from "../context";
import { useWorkflowInteractions } from "../hooks/use-interactions";

export const NodeListSelector = () => {
  const nodes = useAvailableNodes().filter(isSupportedCatalogNode);
  const { handleNodeAdd } = useWorkflowInteractions();
  const nodeSelectorContext = useWorkflowStore((state) => state.nodeSelectorContext);

  const handleNode = (node: NodeCatalog, _props?: NodeCategoryProps) => {
    const resolvedNode = resolveCatalogNode(node);

    if (!resolvedNode) {
      return;
    }

    handleNodeAdd({
      nodeType: resolvedNode.nodeType,
      renderType: resolvedNode.renderType,
      label: node.name,
      description: node.description,
      icon: node.icon,
      iconColor: getCatalogNodeIconColor(node),
      previousNodeId: nodeSelectorContext?.previousNodeId,
      previousNodeSourceHandle: nodeSelectorContext?.previousNodeSourceHandle,
      nextNodeId: nodeSelectorContext?.nextNodeId,
      nextNodeTargetHandle: nodeSelectorContext?.nextNodeTargetHandle,
    });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 z-50 w-80 bg-background border-l border-[var(--border)]">
      <NodeListPanel nodes={nodes} onSelectNode={handleNode} />
    </div>
  );
}