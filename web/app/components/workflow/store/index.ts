import { createStore } from 'zustand/vanilla'
import { createFormState, FormState } from './states/form';
import { ChatEnvState, createChatEnvState } from './states/chat-env';
import { createEnvState, EnvState } from './states/env';
import { createCommonState, CommonState } from './states/common';
import { createPanelState, PanelState } from './states/panel';
import { createNodeState, NodeState } from './states/node';

interface WorkflowStoreProps {
}

export type WorkflowState
  = FormState
  & ChatEnvState
  & EnvState
  & PanelState
  & NodeState
  & CommonState;

export const createWorkflowStore = (props: WorkflowStoreProps) => {
  return createStore<WorkflowState>((...args) => ({
    ...createFormState(...args),
    ...createChatEnvState(...args),
    ...createEnvState(...args),
    ...createCommonState(...args),
    ...createPanelState(...args),
    ...createNodeState(...args),
  }));
}
