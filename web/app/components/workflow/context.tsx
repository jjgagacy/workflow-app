import React, { createContext, useEffect, useRef } from "react";
import { createWorkflowStore, WorkflowState } from "./store";
import { useStore } from "zustand";
import { useNodesSyncDraft } from "./hooks/use-nodesSyncDraft";

interface WorkflowContextProps {
  children: React.ReactNode;
}

type WorkflowStoreType = ReturnType<typeof createWorkflowStore>;

export const WorkflowContext = createContext<WorkflowStoreType | null>(null);

export const WorkflowContextProvider = ({ children }: WorkflowContextProps) => {
  const store = useRef<WorkflowStoreType | null>(null);

  if (!store.current) {
    store.current = createWorkflowStore({});
  }

  return (
    <WorkflowContext.Provider value={store.current}>
      {children}
    </WorkflowContext.Provider>
  );
}

export const WorkflowSyncBridge = () => {
  const { doSyncWorkflowDraft } = useNodesSyncDraft();
  const setDoSyncWorkflowDraft = useWorkflowStore((state) => state.setDoSyncWorkflowDraft);

  useEffect(() => {
    setDoSyncWorkflowDraft(doSyncWorkflowDraft);
  }, [doSyncWorkflowDraft, setDoSyncWorkflowDraft]);

  return null;
}

export const useWorkflowContext = () => {
  const context = React.useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflowContext must be used within a WorkflowContextProvider");
  }
  return context;
}

export function useWorkflowStore<T>(selector: (state: WorkflowState) => T) {
  const store = useWorkflowContext();
  return useStore(store, selector);
}
