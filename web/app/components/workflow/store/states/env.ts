import { StateCreator } from "zustand";

export type EnvState = {
  showEnvPopup: boolean;
}

export const createEnvState: StateCreator<EnvState> = (set, get) => ({
  showEnvPopup: false,
});