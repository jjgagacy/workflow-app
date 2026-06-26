import type { StateCreator } from 'zustand'

export type WorkflowConfigState = {
  initialized: boolean;
  nodeDefaultConfig: Record<string, any>;
}

export type WorkflowSliceCreator = StateCreator<WorkflowConfigState>

export const createWorkflowSlice: WorkflowSliceCreator = (set, get) => ({
  initialized: false,
  nodeDefaultConfig: {},
  setNodeDefaultConfig: (nodeDefaultConfig: Record<string, any>) => { set(() => ({ nodeDefaultConfig })) },
  setInitialized: (initialized: boolean) => { set(() => ({ initialized })) },
});
