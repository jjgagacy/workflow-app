import { StateCreator } from "zustand";
import { Node } from "../../types";

export type WorkflowPanelMode = "side" | "dialog";

export type WorkflowPanelContent = {
  type: "node" | "env";
  title: string;
  node?: Node;
  payload?: Record<string, unknown>;
};

export type PanelState = {
  contextMenu: { x: number; y: number; visible?: boolean; };
  setContextMenu: (position: { y: number; x: number; visible?: boolean }) => void;
  nodeMenu: { x: number; y: number; visible?: boolean; nodeId?: string };
  setNodeMenu: (position: { y: number; x: number; visible?: boolean; nodeId?: string }) => void;
  selectionMenu: { x: number; y: number; visible?: boolean; };
  setSelectionMenu: (position: { y: number; x: number; visible?: boolean }) => void;
  activePanel: WorkflowPanelContent | null;
  panelMode: WorkflowPanelMode;
  panelWidth: number;
  openNodePanel: (node: Node) => void;
  openEnvPanel: () => void;
  updateActivePanelNode: (node: Node) => void;
  closePanel: () => void;
  togglePanelMode: () => void;
  setPanelWidth: (width: number) => void;
}

export const createPanelState: StateCreator<PanelState> = (set, get) => ({
  contextMenu: { y: 0, x: 0, visible: false },
  setContextMenu: (position: { y: number; x: number; visible?: boolean }) => set({ contextMenu: position }),
  nodeMenu: { y: 0, x: 0, visible: false, nodeId: undefined },
  setNodeMenu: (position: { y: number; x: number; visible?: boolean; nodeId?: string }) => set({ nodeMenu: position }),
  selectionMenu: { y: 0, x: 0, visible: false },
  setSelectionMenu: (position: { y: number; x: number; visible?: boolean }) => set({ selectionMenu: position }),
  activePanel: null,
  panelMode: "side",
  panelWidth: 360,
  openNodePanel: (node: Node) => set({
    activePanel: {
      type: "node",
      title: node.data.label || node.id,
      node,
    },
  }),
  openEnvPanel: () => set({
    activePanel: {
      type: "env",
      title: "Env",
      payload: Object.fromEntries(
        Object.entries(process.env).filter(([key]) => key === "NODE_ENV" || key.startsWith("NEXT_PUBLIC_"))
      ),
    },
  }),
  updateActivePanelNode: (node: Node) => set((state) => {
    if (!state.activePanel || state.activePanel.type !== "node") {
      return state;
    }

    return {
      activePanel: {
        ...state.activePanel,
        title: node.data.label || '',
        node,
      },
    };
  }),
  closePanel: () => set({ activePanel: null }),
  togglePanelMode: () => set((state) => ({ panelMode: state.panelMode === "side" ? "dialog" : "side" })),
  setPanelWidth: (width: number) => set({ panelWidth: Math.min(Math.max(width, 280), 640) }),
});
