import { Variable, VariableSelector, Node } from "../types";
import { useWorkflow } from "./use-workflow";
import { useNodeAvailableVariableList } from "./use-node-available-variable-list";

type NodeVariableListParams = {
  filterVariable: (variable: Variable, selector: VariableSelector) => boolean;
  availableNodes?: Node[];
  onlyLeafNodeVars?: boolean;
  hiddenEnv?: boolean;
};

export const useWorkflowVariables = (nodeId: string, {
  filterVariable,
  availableNodes = [],
  onlyLeafNodeVars,
  hiddenEnv,
}: NodeVariableListParams = {
    onlyLeafNodeVars: false,
    filterVariable: () => true,
  }) => {
  const { getNodeAvailableVariableList } = useNodeAvailableVariableList();

  const { getLeafNodes, getUpstreamNodesWithParent, getNodeInfo } = useWorkflow();
  const usingNodes = availableNodes && availableNodes.length > 0 ? availableNodes : (onlyLeafNodeVars ? getLeafNodes(nodeId) : getUpstreamNodesWithParent(nodeId)) as Node[];
  const nodeInfo = getNodeInfo(nodeId);
  const parentNode = nodeInfo?.parentNode as any;

  const nodeVariableList = getNodeAvailableVariableList({
    parentNode,
    availableNodes: usingNodes as any,
    filterVariable,
    hiddenEnv,
  });

  return {
    nodeVariableList,
    availableNodes: usingNodes,
    getNodeAvailableVariableList,
  }
}