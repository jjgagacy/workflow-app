import { useTranslation } from "react-i18next";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { NodeType, type Edge, type Node } from "../types";
import { useNodesVariables } from "./use-nodesVariables";
import { useVariables } from "./use-variables";
import { useMemo } from "react";
import { useWorkflowNodes } from "./use-workflowNodes";
import { CUSTOM_NODE_NAME, NODE_DEFAULT_DATA } from "../constants";
import { useNodeBehaviors } from "./use-nodeBehaviors";
import { isEnvVar, isSessionVar, isSystemVar } from "../utils/var";

type CheckNodeList = {
  id: string;
  type: string;
  label?: string;
  invalidNode: boolean;
  errorMessage?: string;
}

export const useCheckList = () => {
  const { t } = useTranslation();
  const reactFlow = useReactFlow<Node, Edge>();
  const storeApi = useStoreApi<Node, Edge>();
  const { getExecutableWorkflowNodes } = useWorkflowNodes();

  const nodeVariablesMap = useNodesVariables(reactFlow.getNodes());
  const { getNodeVariableSelectors } = useVariables();
  const nodeBehaviors = useNodeBehaviors();
  // console.log('map', nodeVariablesMap);

  const checkNodesList = useMemo(() => {
    const res: CheckNodeList[] = [];
    const { nodes, edges } = storeApi.getState();
    const { validNodes } = getExecutableWorkflowNodes(nodes.filter(n => n.type === CUSTOM_NODE_NAME), edges);

    nodes.forEach((node) => {
      const nodeOtherData = {};
      const nodeVariableSelectors = getNodeVariableSelectors(node);
      if (node.type === CUSTOM_NODE_NAME) {
        let { errorMessage } = nodeBehaviors[node.data.type].validate(node.data, t, nodeOtherData);

        if (!errorMessage) {
          const availableVariables = nodeVariablesMap[node.id]?.variableList || [];

          for (const variableSelector of nodeVariableSelectors) {
            const isEnv = isEnvVar(variableSelector);
            const isSessVar = isSessionVar(variableSelector);
            const isSysVar = isSystemVar(variableSelector);
            if (!isEnv && !isSessVar && !isSysVar) {
              const foundNode = availableVariables.find(v => v.nodeId === variableSelector.nodeId);
              if (foundNode) {
                const foundVar = foundNode.variables.find(v => v.name === variableSelector.path[0]);
                if (!foundVar) {
                  errorMessage = t('workflow.checkList.error.variableNotFound');
                }
              } else {
                errorMessage = t('workflow.checkList.error.variableNotFound');
              }
            }
          }
        }

        const isInvalidNode = validNodes.findIndex(n => n.id === node.id) === -1;
        if (errorMessage || isInvalidNode) {
          res.push({
            id: node.id,
            type: node.data.type,
            label: node.data.label,
            invalidNode: isInvalidNode,
            errorMessage,
          });
        }
      }
    });

    if (!nodes.find((node) => node.data.type === NodeType.End)) {
      res.push({
        id: 'end-node',
        type: NodeType.End,
        label: t('workflow.nodes.end.name'),
        invalidNode: true,
        errorMessage: t('workflow.checkList.error.endNodeMissing'),
      })
    }

    return res;
  }, [storeApi, nodeVariablesMap, t, getNodeVariableSelectors, nodeBehaviors, getExecutableWorkflowNodes]);

  return {
    checkNodesList,
  }
};