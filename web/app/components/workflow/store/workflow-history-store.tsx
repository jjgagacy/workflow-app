import { Edge, Node } from "../types";
import { create } from 'zustand';
import { type TemporalState, temporal } from 'zundo'
import isDeepEqual from 'fast-deep-equal'
import { WorkflowHistoryEvent } from "../hooks/use-workflow-history";
import { createContext, useState } from "react";

export const WorkflowHistoryContext = createContext<ReturnType<typeof createStore> | null>(null);

export type WorkflowHistoryState = {
  nodes: Node[];
  edges: Edge[];
  addHistory?: (nodes: Node[], edges: Edge[]) => void;
  clearHistory?: () => void;
  historyEvent?: WorkflowHistoryEvent | null;
}

function createStore({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
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

export const WorkflowHistoryStore = () => {
}

export const useWorkflowHistory = () => {
}

interface WorkflowHistoryProviderProps {
  nodes: Node[];
  edges: Edge[];
  children: React.ReactNode;
}

export const WorkflowHistoryProvider = ({ nodes, edges, children }: WorkflowHistoryProviderProps) => {
  const [store] = useState(() => createStore({ nodes, edges }));

  return (
    <WorkflowHistoryContext.Provider value={store}>
      {children}
    </WorkflowHistoryContext.Provider>
  );
}
