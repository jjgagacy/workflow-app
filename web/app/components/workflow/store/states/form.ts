import { StateCreator } from "zustand";

export type FormState = {
  inputs: Record<string, string>;
}

export const createFormState: StateCreator<FormState> = (set, get) => ({
  inputs: {},
});
