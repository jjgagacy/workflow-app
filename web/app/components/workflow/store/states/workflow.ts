import type { StateCreator } from 'zustand'

export type WorkflowConfigState = {
  initialized: boolean;
  nodeDefaultConfig: Record<string, any>;
  doSyncWorkflowDraft: () => Promise<void>;
  setDoSyncWorkflowDraft: (fn: () => Promise<void>) => void;
}

export type WorkflowSliceCreator = StateCreator<WorkflowConfigState>

export const createWorkflowSlice: WorkflowSliceCreator = (set, get) => ({
  initialized: false,
  nodeDefaultConfig: {},
  setNodeDefaultConfig: (nodeDefaultConfig: Record<string, any>) => { set(() => ({ nodeDefaultConfig })) },
  setInitialized: (initialized: boolean) => { set(() => ({ initialized })) },
  doSyncWorkflowDraft: async () => { },
  setDoSyncWorkflowDraft: (fn: () => Promise<void>) => { set(() => ({ doSyncWorkflowDraft: fn })) },
});
