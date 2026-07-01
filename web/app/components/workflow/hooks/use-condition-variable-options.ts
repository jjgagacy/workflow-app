import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../context";
import { NodeType } from "../types";
import type { Node } from "../types";

export type VariableOption = {
  label: string;
  value: string;
  group: string;
  description?: string;
};

const formatVariableType = (type?: string) => type ?? "any";

export const useConditionVariableOptions = (nodeId: string) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const nodes = store.getState().nodes as Node[];

  const variableOptions = useMemo<VariableOption[]>(() => {
    const environmentOptions = envVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `env.${envVariable.name}`,
      group: t("workflow.conditions.variableGroups.environment"),
      description: formatVariableType(envVariable.type),
    }));

    const sessionOptions = chatEnvVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `session.${envVariable.name}`,
      group: t("workflow.conditions.variableGroups.session"),
      description: formatVariableType(envVariable.type),
    }));

    const builtInOptions: VariableOption[] = [
      {
        label: t("workflow.conditions.builtIns.workflowInput"),
        value: "input",
        group: t("workflow.conditions.variableGroups.builtIn"),
        description: "object",
      },
      {
        label: t("workflow.conditions.builtIns.currentUser"),
        value: "system.user",
        group: t("workflow.conditions.variableGroups.builtIn"),
        description: "object",
      },
      {
        label: t("workflow.conditions.builtIns.currentTime"),
        value: "system.time",
        group: t("workflow.conditions.variableGroups.builtIn"),
        description: "datetime",
      },
    ];

    const nodeOptions = nodes
      .filter((workflowNode) => workflowNode.id !== nodeId && workflowNode.data.type !== NodeType.Start)
      .map((workflowNode) => ({
        label: workflowNode.data.label?.trim() || workflowNode.id,
        value: `nodes.${workflowNode.id}.output`,
        group: t("workflow.conditions.variableGroups.nodeOutputs"),
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
  };
};
