import { StateCreator } from "zustand";

export type CommonState = {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  showNodeSelector: boolean;
  setShowNodeSelector: (show: boolean) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
}

export const createCommonState: StateCreator<CommonState> = (set, get) => ({
  showSidebar: false,
  setShowSidebar: (show: boolean) => set({ showSidebar: show }),
  showNodeSelector: false,
  setShowNodeSelector: (show: boolean) => set({ showNodeSelector: show }),
  showCommandPalette: false,
  setShowCommandPalette: (show: boolean) => set({ showCommandPalette: show }),
});
