import type { StateCreator } from 'zustand'
import { WorkflowRunningState } from '../../types';
import { debounce } from 'lodash-es';

export type WorkflowConfigState = {
  initialized: boolean;
  nodeDefaultConfig: Record<string, any>;
  doSyncWorkflowDraft: () => Promise<void>;
  setDoSyncWorkflowDraft: (fn: () => Promise<void>) => void;
  debounceSyncWorkflowDraft: () => Promise<void>;
  setDebounceSyncWorkflowDraft: (fn: () => Promise<void>) => void;
  workflowRunningState?: WorkflowRunningState;
  setWorkflowRunningState: (state: WorkflowRunningState) => void;
  isSyncWorkflowDraft?: boolean;
  setIsSyncWorkflowDraft: (isSync: boolean) => void;
  draftUpdatedAt: number;
  setDraftUpdatedAt: (updatedAt: number) => void;
}

export type WorkflowSliceCreator = StateCreator<WorkflowConfigState>

export const createWorkflowSlice: WorkflowSliceCreator = (set, get) => ({
  initialized: false,
  nodeDefaultConfig: {},
  setNodeDefaultConfig: (nodeDefaultConfig: Record<string, any>) => { set(() => ({ nodeDefaultConfig })) },
  setInitialized: (initialized: boolean) => { set(() => ({ initialized })) },
  doSyncWorkflowDraft: async () => { },
  setDoSyncWorkflowDraft: (fn: () => Promise<void>) => { set(() => ({ doSyncWorkflowDraft: fn })) },
  debounceSyncWorkflowDraft: async () => { },
  setDebounceSyncWorkflowDraft: debounce((syncWorkflowDraft) => {
    syncWorkflowDraft();
  }),
  workflowRunningState: undefined,
  setWorkflowRunningState: (state: WorkflowRunningState) => { set(() => ({ workflowRunningState: state })) },
  isSyncWorkflowDraft: false,
  setIsSyncWorkflowDraft: (isSync: boolean) => { set(() => ({ isSyncWorkflowDraft: isSync })) },
  draftUpdatedAt: 0,
  setDraftUpdatedAt: (updatedAt: number) => { set(() => ({ draftUpdatedAt: updatedAt })) },
});
