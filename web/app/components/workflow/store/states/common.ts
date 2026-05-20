import { StateCreator } from "zustand";

export type CommonState = {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showNodeSelector: boolean;
  setShowNodeSelector: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  mousePosition: { x: number; y: number, offsetX: number, offsetY: number };
  setMousePosition: (position: { x: number; y: number, offsetX: number, offsetY: number }) => void;
}

export const createCommonState: StateCreator<CommonState> = (set, get) => ({
  showSidebar: false,
  setShowSidebar: (show: boolean) => set({ showSidebar: show }),
  showNodeSelector: false,
  setShowNodeSelector: (show: boolean) => set({ showNodeSelector: show }),
  showCommandPalette: false,
  setShowCommandPalette: (show: boolean) => set({ showCommandPalette: show }),
  mousePosition: { x: 0, y: 0, offsetX: 0, offsetY: 0 },
  setMousePosition: (position: { x: number; y: number, offsetX: number, offsetY: number }) => set({ mousePosition: position }),
});
