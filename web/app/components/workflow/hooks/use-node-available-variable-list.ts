import { useCallback } from "react";
import { useWorkflowContext } from "../context";
import { NodeOutputVariable, Variable, VariableSelector, Node, NodeType, VariableGroup } from "../types";
import { useNodeOutputVariables } from "./use-node-output-variables";

export type GetNodeAvailableVariableListParams = {
  parentNode?: Node | null;
  availableNodes?: Node[];
  isChatMode?: boolean;
  filterVariable?: (variable: Variable, selector: VariableSelector) => boolean;
  hiddenEnv?: boolean;
};

// 获取节点可用变量列表
export const useNodeAvailableVariableList = () => {
  const workflowContext = useWorkflowContext();
  const { getNodeOutputVariables } = useNodeOutputVariables();

  const getNodeAvailableVariableList = useCallback(({
    parentNode,
    availableNodes,
    isChatMode,
    filterVariable = () => true,
    hiddenEnv,
  }: GetNodeAvailableVariableListParams): NodeOutputVariable[] => {
    const { envVariables, chatEnvVariables } = workflowContext.getState();

    const variables = getNodeOutputVariables(
      availableNodes || [],
      isChatMode || false,
      filterVariable,
      envVariables,
      chatEnvVariables,
    );

    const isInIteration = parentNode
      ? (parentNode.data.type === NodeType.Iteration || parentNode.data.type === NodeType.Loop)
      : false;

    if (isInIteration) {
      // todo
    }

    if (hiddenEnv) {
      return variables.filter((item) => item.nodeId !== VariableGroup.env && item.nodeId !== VariableGroup.session);
    }

    return variables;
  }, [getNodeOutputVariables, workflowContext]);

  return {
    getNodeAvailableVariableList,
  };
};
