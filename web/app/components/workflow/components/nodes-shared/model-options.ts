export type WorkflowModelOption = {
  id: string;
  name: string;
  provider: string;
  description?: string;
};

export type WorkflowModelSelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

export const WORKFLOW_MODEL_OPTIONS: WorkflowModelOption[] = [
  {
    id: 'openai:gpt-4o-mini',
    name: 'gpt-4o-mini',
    provider: 'OpenAI',
    description: '轻量快速，适合分类任务。',
  },
  {
    id: 'openai:gpt-4.1',
    name: 'gpt-4.1',
    provider: 'OpenAI',
    description: '更稳定的复杂理解能力。',
  },
  {
    id: 'anthropic:claude-3-5-haiku',
    name: 'claude-3-5-haiku',
    provider: 'Anthropic',
    description: '低延迟、成本友好。',
  },
  {
    id: 'anthropic:claude-3-7-sonnet',
    name: 'claude-3-7-sonnet',
    provider: 'Anthropic',
    description: '平衡速度与推理能力。',
  },
];

export const WORKFLOW_MODEL_DEFAULT_ID = WORKFLOW_MODEL_OPTIONS[0]?.id || '';

export const getWorkflowModelById = (modelId?: string) => {
  if (!modelId) {
    return undefined;
  }

  return WORKFLOW_MODEL_OPTIONS.find((option) => option.id === modelId);
};

export const getWorkflowModelSelectItems = (): WorkflowModelSelectItem[] => {
  return WORKFLOW_MODEL_OPTIONS.map((option) => ({
    value: option.id,
    name: option.name,
    description: option.description,
    group: option.provider,
  }));
};
