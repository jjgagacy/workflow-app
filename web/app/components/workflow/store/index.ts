import { createStore } from 'zustand/vanilla'
import { createFormState, FormState } from './states/form';
import { createEnvState, EnvState } from './states/env';
import { createCommonState, CommonState } from './states/common';

interface WorkflowStoreProps {
}

export type WorkflowState
  = FormState
  & EnvState
  & CommonState;

export const createWorkflowStore = (props: WorkflowStoreProps) => {
  return createStore<WorkflowState>((...args) => ({
    ...createFormState(...args),
    ...createEnvState(...args),
    ...createCommonState(...args),
  }));
}