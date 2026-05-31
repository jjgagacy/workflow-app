import { Node } from "../../types";
import { StateCreator } from "zustand";

export type WorkflowInteractionMode = 'pointer' | 'hand';

export type NodeSelectorContext = {
  previousNodeId?: string;
  previousNodeSourceHandle?: string;
  nextNodeId?: string;
  nextNodeTargetHandle?: string;
};

export type CommonState = {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showNodeSelector: boolean;
  setShowNodeSelector: (show: boolean, context?: NodeSelectorContext | null) => void;
  nodeSelectorContext: NodeSelectorContext | null;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  interactionMode: WorkflowInteractionMode;
  setInteractionMode: (mode: WorkflowInteractionMode) => void;
  mousePosition: { x: number; y: number, offsetX: number, offsetY: number };
  setMousePosition: (position: { x: number; y: number, offsetX: number, offsetY: number }) => void;
  copiedNodes: Node[];
  setCopiedNodes: (nodes: Node[]) => void;
}

export const createCommonState: StateCreator<CommonState> = (set, get) => ({
  showSidebar: false,
  setShowSidebar: (show: boolean) => set({ showSidebar: show }),
  showNodeSelector: false,
  setShowNodeSelector: (show: boolean, context: NodeSelectorContext | null = null) => set({
    showNodeSelector: show,
    nodeSelectorContext: show ? context : null,
  }),
  nodeSelectorContext: null,
  showCommandPalette: false,
  setShowCommandPalette: (show: boolean) => set({ showCommandPalette: show }),
  interactionMode: 'pointer',
  setInteractionMode: (mode: WorkflowInteractionMode) => set({ interactionMode: mode }),
  mousePosition: { x: 0, y: 0, offsetX: 0, offsetY: 0 },
  setMousePosition: (position: { x: number; y: number, offsetX: number, offsetY: number }) => set({ mousePosition: position }),
  copiedNodes: [],
  setCopiedNodes: (nodes: Node[]) => set({ copiedNodes: nodes }),
});
