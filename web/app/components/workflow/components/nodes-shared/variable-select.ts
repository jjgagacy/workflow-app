import type { TFunction } from "i18next";
import type { WorkflowChatEnvVariable } from "../../store/states/chat-env";
import type { WorkflowEnvVariable } from "../../store/states/env";
import type { Node } from "../../types";
import { NodeType } from "../../types";

export type WorkflowVariableOption = {
  label: string;
  value: string;
  group: string;
  description?: string;
};

export type WorkflowVariableSelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

const formatVariableType = (type?: string) => type ?? 'any';

type BuildWorkflowVariableOptionsParams = {
  t: TFunction;
  nodeId: string;
  nodes: Node[];
  envVariables: WorkflowEnvVariable[];
  chatEnvVariables: WorkflowChatEnvVariable[];
};

export const buildWorkflowVariableOptions = ({
  t,
  nodeId,
  nodes,
  envVariables,
  chatEnvVariables,
}: BuildWorkflowVariableOptionsParams): WorkflowVariableOption[] => {
  const builtInOptions: WorkflowVariableOption[] = [
    {
      label: t('workflow.conditions.builtIns.workflowInput'),
      value: 'input',
      group: t('workflow.conditions.variableGroups.builtIn'),
      description: 'object',
    },
    {
      label: t('workflow.conditions.builtIns.currentUser'),
      value: 'system.user',
      group: t('workflow.conditions.variableGroups.builtIn'),
      description: 'object',
    },
    {
      label: t('workflow.conditions.builtIns.currentTime'),
      value: 'system.time',
      group: t('workflow.conditions.variableGroups.builtIn'),
      description: 'datetime',
    },
  ];

  const environmentOptions: WorkflowVariableOption[] = envVariables.map((envVariable) => ({
    label: envVariable.name,
    value: `env.${envVariable.name}`,
    group: t('workflow.conditions.variableGroups.environment'),
    description: formatVariableType(envVariable.type),
  }));

  const sessionOptions: WorkflowVariableOption[] = chatEnvVariables.map((envVariable) => ({
    label: envVariable.name,
    value: `session.${envVariable.name}`,
    group: t('workflow.conditions.variableGroups.session'),
    description: formatVariableType(envVariable.type),
  }));

  const nodeOptions: WorkflowVariableOption[] = nodes
    .filter((workflowNode) => workflowNode.id !== nodeId && workflowNode.data.type !== NodeType.Start)
    .map((workflowNode) => ({
      label: workflowNode.data.label?.trim() || workflowNode.id,
      value: `nodes.${workflowNode.id}.output`,
      group: t('workflow.conditions.variableGroups.nodeOutputs'),
      description: 'any',
    }));

  return [
    ...builtInOptions,
    ...environmentOptions,
    ...sessionOptions,
    ...nodeOptions,
  ];
};

type BuildVariableSelectItemsParams = {
  t: TFunction;
  currentValue: string;
  options: WorkflowVariableOption[];
};

export const buildVariableSelectItems = ({
  t,
  currentValue,
  options,
}: BuildVariableSelectItemsParams): WorkflowVariableSelectItem[] => {
  return [
    ...(!currentValue ? [{ value: '', name: t('workflow.conditions.selectVariable') }] : []),
    ...(
      currentValue && !options.some((option) => option.value === currentValue)
        ? [{ value: currentValue, name: currentValue, description: t('workflow.conditions.currentValue') }]
        : []
    ),
    ...options.map((option) => ({
      value: option.value,
      name: option.label,
      description: option.description,
      group: option.group,
    })),
  ];
};
