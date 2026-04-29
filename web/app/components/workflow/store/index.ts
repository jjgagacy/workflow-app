import { createStore } from 'zustand/vanilla'
import { createFormState, FormState } from './states/form';
import { createEnvState, EnvState } from './states/env';

interface WorkflowStoreProps {
}

export type WorkflowState
  = FormState
  & EnvState;

export const createWorkflowStore = (props: WorkflowStoreProps) => {
  return createStore<WorkflowState>((...args) => ({
    ...createFormState(...args),
    ...createEnvState(...args),
  }));
}