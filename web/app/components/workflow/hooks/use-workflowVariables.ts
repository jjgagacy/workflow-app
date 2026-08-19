import { useTranslation } from "react-i18next";
import { useStoreApi, useReactFlow, Node as ReactFlowNode } from "@xyflow/react";
import { useCallback } from "react";
import { NodeOutputVariable, Variable, VariableSelector, Node, NodeType } from "../types";
import { useWorkflowContext } from "../context";
import { useVariables } from "./use-variables";
import { SUPPORT_OUTPUT_VARIABLE_NODE_TYPES } from "../constants";
import { useWorkflow } from "./use-workflow";
import { WorkflowEnvVariable } from "../store/states/env";
import { WorkflowChatEnvVariable } from "../store/states/chat-env";

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
  const storeApi = useStoreApi();
  const workflowContext = useWorkflowContext();
  const reactFlow = useReactFlow();
  const { t } = useTranslation();
  const { getSystemVariables, getNodeOutputVariable } = useVariables();

  /// 获取节点输出变量列表
  const getNodeOutputVariables = (
    nodes: Node[],
    isChatMode: boolean,
    filterVariable: (variable: Variable, selector: VariableSelector) => boolean,
    envVariables?: WorkflowEnvVariable[],
    chatEnvVariables?: WorkflowChatEnvVariable[],
  ): NodeOutputVariable[] => {
    const envMode = {
      id: 'env',
      data: {
        title: 'workflow.var.groups.env',
        type: 'env',
        envVariables: envVariables || [],
      }
    };

    const chatMode = {
      id: 'session',
      data: {
        title: 'workflow.var.groups.session',
        type: 'session',
        chatEnvVariables: chatEnvVariables || [],
      }
    }

    const systemMode = {
      id: 'system',
      data: {
        title: 'workflow.var.groups.system',
        type: 'system',
        globalVariables: getSystemVariables(isChatMode),
      }
    }

    const sortedNodes = [...nodes].sort((a, b) => {
      const aType = a.data.type as any;
      const bType = b.data.type as any;
      if (aType === NodeType.Start)
        return 1;
      if (bType === NodeType.Start)
        return -1;
      if (aType === 'env')
        return 1
      if (bType === 'env')
        return -1
      if (aType === 'session')
        return 1
      if (bType === 'session')
        return -1
      if (aType === 'system')
        return 1
      if (bType === 'system')
        return -1
      // sort nodes by x position
      return (b.position?.x || 0) - (a.position?.x || 0);
    });

    const res = [
      ...(sortedNodes).filter(node =>
        SUPPORT_OUTPUT_VARIABLE_NODE_TYPES.includes(node.data.type as NodeType)
      ),
      ...(envVariables && envVariables.length > 0 ? [envMode] : []),
      ...(chatEnvVariables && chatEnvVariables.length > 0 ? [chatMode] : []),
      systemMode,
    ]
      .map(node => {
        return getNodeOutputVariable(node, isChatMode, filterVariable);
      })
      .filter(variable => variable.variables.length > 0);
    return res;
  }

  /// 获取节点可用变量列表
  const getNodeAvailableVariableList = useCallback(({
    parentNode,
    availableNodes,
    isChatMode,
    filterVariable = () => true,
    hiddenEnv,
  }: {
    parentNode?: Node | null,
    availableNodes?: Node[],
    isChatMode?: boolean,
    filterVariable?: (variable: Variable, selector: VariableSelector) => boolean,
    hiddenEnv?: boolean,
  }): NodeOutputVariable[] => {
    const { nodes, edges } = storeApi.getState();
    const {
      envVariables,
      chatEnvVariables
    } = workflowContext.getState();

    const variables = getNodeOutputVariables(
      availableNodes || [],
      isChatMode || false,
      filterVariable,
      envVariables,
      chatEnvVariables,
    );
    // 
    const isInIteration = parentNode ? (parentNode.data.type === NodeType.Iteration || parentNode.data.type === NodeType.Loop) : false;
    if (isInIteration) {
      // todo
    }
    return variables;
  }, [storeApi]);

  /// 获取节点可用变量列表
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
  }
}