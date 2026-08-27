import { useCallback } from "react";
import { NodeOutputVariable, Variable, VariableSelector, Node, NodeType, VariableGroup } from "../types";
import { SUPPORT_OUTPUT_VARIABLE_NODE_TYPES } from "../constants";
import { useVariables } from "./use-variables";
import { WorkflowEnvVariable } from "../store/states/env";
import { WorkflowChatEnvVariable } from "../store/states/chat-env";

export const useNodeOutputVariables = () => {
  const { getSystemVariables, getNodeOutputVariable } = useVariables();

  // 获取节点输出变量列表
  const getNodeOutputVariables = useCallback((
    nodes: Node[],
    isChatMode: boolean,
    filterVariable: (variable: Variable, selector: VariableSelector) => boolean,
    envVariables?: WorkflowEnvVariable[],
    chatEnvVariables?: WorkflowChatEnvVariable[],
  ): NodeOutputVariable[] => {
    const envMode = {
      id: VariableGroup.env,
      data: {
        title: "workflow.var.groups.env",
        type: "env",
        envVariables: envVariables || [],
      },
    };

    const chatMode = {
      id: VariableGroup.session,
      data: {
        title: "workflow.var.groups.session",
        type: "session",
        chatEnvVariables: chatEnvVariables || [],
      },
    };

    const systemMode = {
      id: VariableGroup.system,
      data: {
        title: "workflow.var.groups.system",
        type: "system",
        globalVariables: getSystemVariables(isChatMode),
      },
    };

    const sortedNodes = [...nodes].sort((a, b) => {
      const aType = a.data.type as any;
      const bType = b.data.type as any;
      if (aType === NodeType.Start) return 1;
      if (bType === NodeType.Start) return -1;
      if (aType === VariableGroup.env) return 1;
      if (bType === VariableGroup.env) return -1;
      if (aType === VariableGroup.session) return 1;
      if (bType === VariableGroup.session) return -1;
      if (aType === VariableGroup.system) return 1;
      if (bType === VariableGroup.system) return -1;
      return (b.position?.x || 0) - (a.position?.x || 0);
    });

    const res = [
      ...sortedNodes.filter((node) =>
        SUPPORT_OUTPUT_VARIABLE_NODE_TYPES.includes(node.data.type as NodeType)
      ),
      ...(envVariables && envVariables.length > 0 ? [envMode] : []),
      ...(chatEnvVariables && chatEnvVariables.length > 0 ? [chatMode] : []),
      systemMode,
    ]
      .map((node) => getNodeOutputVariable(node, isChatMode, filterVariable))
      .filter((variable) => variable.variables.length > 0);

    return res;
  }, [getNodeOutputVariable, getSystemVariables]);

  return {
    getNodeOutputVariables,
  };
};
