import { Edge, Node } from "../types";
import { create, StoreApi } from 'zustand';
import { type TemporalState, temporal } from 'zundo'
import isDeepEqual from 'fast-deep-equal'
import { WorkflowHistoryEvent } from "../hooks/use-workflow-history";
import { createContext, useContext, useMemo, useState } from "react";

type WorkflowHistoryContextType = {
  store: ReturnType<typeof createStore>;
  shortcutsEnable: boolean;
  setShortcutsEnable: (enable: boolean) => void;
}
export const WorkflowHistoryContext = createContext<WorkflowHistoryContextType | null>(null);

export type WorkflowHistoryState = {
  nodes: Node[];
  edges: Edge[];
  addHistory?: (nodes: Node[], edges: Edge[]) => void;
  clearHistory?: () => void;
  historyEvent?: WorkflowHistoryEvent | null;
}

export type WorkflowHistoryStoreApi = StoreApi<WorkflowHistoryState> & { temporal: StoreApi<TemporalState<WorkflowHistoryState>> };

function createStore({ nodes, edges }: { nodes: Node[]; edges: Edge[] }): WorkflowHistoryStoreApi {
  const store = create(temporal<WorkflowHistoryState>(
    (set, get) => {
      return {
        nodes,
        edges,
        historyEvent: null,
        getNodes: () => get().nodes,
        setNodes: (nodes: Node[]) => set({ nodes }),
        setEdges: (edges: Edge[]) => set({ edges }),
      }
    }, {
    equality: (pastState, currentState) => isDeepEqual(pastState, currentState),
  }));
  return store;
}

export const useWorkflowHistoryStore = () => {
  const store = useContext(WorkflowHistoryContext);
  if (!store) {
    throw new Error("useWorkflowHistoryStore must be used within a WorkflowHistoryProvider");
  }
  const { store: workflowHistoryStore, shortcutsEnable, setShortcutsEnable } = store;
  return {
    store: useMemo(() => ({
      getState: workflowHistoryStore.getState,
      setState: (state: Partial<WorkflowHistoryState>) => workflowHistoryStore.setState({
        historyEvent: state.historyEvent || null,
        nodes: state.nodes?.map((node: Node) => ({ ...node })) || workflowHistoryStore.getState().nodes,
        edges: state.edges?.map((edge: Edge) => ({ ...edge })) || workflowHistoryStore.getState().edges,
      }),
      subscribe: workflowHistoryStore.subscribe,
      temporal: workflowHistoryStore.temporal,
    }), [workflowHistoryStore]),
    shortcutsEnable,
    setShortcutsEnable
  }
}

interface WorkflowHistoryProviderProps {
  nodes: Node[];
  edges: Edge[];
  children: React.ReactNode;
}

export const WorkflowHistoryProvider = ({ nodes, edges, children }: WorkflowHistoryProviderProps) => {
  const [shortcutsEnable, setShortcutsEnable] = useState(true);
  const [store] = useState(() => createStore({ nodes, edges }));

  return (
    <WorkflowHistoryContext.Provider value={{ store, shortcutsEnable, setShortcutsEnable }}>
      {children}
    </WorkflowHistoryContext.Provider>
  );
}
