import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../context";
import { NodeType } from "../types";
import type { Node } from "../types";
import { useVariables } from "./use-variables";
import { useWorkflowVariables } from "./use-workflowVariables";

export type VariableOption = {
  label: string;
  value: string;
  group: string;
  description?: string;
};

const formatVariableType = (type?: string) => type ?? "any";

export const useNodeConfig = (nodeId: string) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const nodes = store.getState().nodes as Node[];
  const { getSystemVariables } = useVariables();
  const { availableNodes, nodeVariableList } = useWorkflowVariables(nodeId);

  const variableOptions = useMemo<VariableOption[]>(() => {
    const environmentOptions = envVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `env.${envVariable.name}`,
      group: t("workflow.vars.groups.env"),
      description: formatVariableType(envVariable.type),
    }));

    const sessionOptions = chatEnvVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `session.${envVariable.name}`,
      group: t("workflow.var.groups.session"),
      description: formatVariableType(envVariable.type),
    }));

    const builtInOptions: VariableOption[] = getSystemVariables(false).map((variable) => ({
      label: variable.label || variable.name,
      value: `builtins.${variable.name}`,
      group: t("workflow.var.groups.system"),
      description: formatVariableType(variable.dataType),
    }));

    const nodeOptions = nodes
      .filter((workflowNode) => workflowNode.id !== nodeId && workflowNode.data.type !== NodeType.Start)
      .map((workflowNode) => ({
        label: workflowNode.data.label?.trim() || workflowNode.id,
        value: `nodes.${workflowNode.id}.output`,
        group: t("workflow.var.groups.nodeOutput"),
        description: "any",
      }));

    return [...builtInOptions, ...environmentOptions, ...sessionOptions, ...nodeOptions];
  }, [chatEnvVariables, envVariables, nodeId, nodes, t]);

  const variableOptionGroups = useMemo(() => {
    return variableOptions.reduce<Record<string, VariableOption[]>>((accumulator, option) => {
      if (!accumulator[option.group]) {
        accumulator[option.group] = [];
      }

      accumulator[option.group].push(option);
      return accumulator;
    }, {});
  }, [variableOptions]);

  return {
    variableOptions,
    variableOptionGroups,
    availableNodes,
    nodeVariableList
  };
};
