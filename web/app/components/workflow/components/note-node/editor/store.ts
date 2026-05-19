'use client';

import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand"
import { NoteEditorContext } from "./context";

type State = {

}

export type NoteEditorStore = ReturnType<typeof createNoteEditorStore>;

export const createNoteEditorStore = () => {
  return createStore<State>((set, get) => ({

  }));
}

export const useNoteEditorStore = function <T>(selector: (state: State) => T): T {
  const store = createNoteEditorStore();
  if (!store) {
    throw new Error("NoteEditorStore is not initialized");
  }
  return useStore(store, selector);
}

export const useNoteEditorContext = () => {
  return useContext(NoteEditorContext);
}
