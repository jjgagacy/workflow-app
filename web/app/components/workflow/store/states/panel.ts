import { StateCreator } from "zustand";

export type PanelState = {
  contextMenu: { x: number; y: number; visible?: boolean; };
  setContextMenu: (position: { y: number; x: number; visible?: boolean }) => void;
  nodeMenu: { x: number; y: number; visible?: boolean; nodeId?: string };
  setNodeMenu: (position: { y: number; x: number; visible?: boolean; nodeId?: string }) => void;
  selectionMenu: { x: number; y: number; visible?: boolean; };
  setSelectionMenu: (position: { y: number; x: number; visible?: boolean }) => void;
}

export const createPanelState: StateCreator<PanelState> = (set, get) => ({
  contextMenu: { y: 0, x: 0, visible: false },
  setContextMenu: (position: { y: number; x: number; visible?: boolean }) => set({ contextMenu: position }),
  nodeMenu: { y: 0, x: 0, visible: false, nodeId: undefined },
  setNodeMenu: (position: { y: number; x: number; visible?: boolean; nodeId?: string }) => set({ nodeMenu: position }),
  selectionMenu: { y: 0, x: 0, visible: false },
  setSelectionMenu: (position: { y: number; x: number; visible?: boolean }) => set({ selectionMenu: position }),
});
