import { NodeOutputVariable, NodeType, type Node, type Variable, type VariableSelector } from "../types";
import { useWorkflow } from "./use-workflow";
import { useNodeAvailableVariableList } from "./use-node-available-variable-list";

type NodesVariablesParams = {
  filterVariable?: (variable: Variable, selector: VariableSelector) => boolean;
  availableNodes?: Node[];
  onlyLeafNodeVars?: boolean;
  hiddenEnv?: boolean;
};

type NodeVariablesMap = Record<string, {
  node: Node;
  variableList: NodeOutputVariable[];
  availableNodes: Node[];
}>;

// 获取多个节点的可用变量map列表
export const useNodesVariables = (nodes: Node[], params?: NodesVariablesParams) => {
  const {
    filterVariable = () => true,
    onlyLeafNodeVars = false,
    hiddenEnv = false,
    availableNodes
  } = params || {};
  const { getLeafNodes, getUpstreamNodesWithParent, getNodeInfo } = useWorkflow();
  const nodeVariablesMap: NodeVariablesMap = {};
  const { getNodeAvailableVariableList } = useNodeAvailableVariableList();

  nodes.forEach((node) => {
    const nodeId = node.id;
    const usingNodes = availableNodes && availableNodes.length > 0 ? availableNodes : (onlyLeafNodeVars ? getLeafNodes(nodeId) : getUpstreamNodesWithParent(nodeId)) as Node[];
    if (node.data.type === NodeType.Loop)
      usingNodes.push(node);
    const nodeInfo = getNodeInfo(nodeId);
    const parentNode = nodeInfo?.parentNode as any;

    const variableList = getNodeAvailableVariableList({
      parentNode,
      availableNodes: usingNodes as any,
      filterVariable,
      hiddenEnv,
    });

    nodeVariablesMap[nodeId] = {
      node,
      variableList,
      availableNodes: usingNodes as any,
    };
  });

  return nodeVariablesMap;
};
