'use client';

import { useContext } from "react";
import { createStore, useStore } from "zustand"
import { NoteEditorContext } from "./context";

type State = {
  selectionBold: boolean;
  selectionItalic: boolean;
  selectionUnderline: boolean;
  selectionStrikethrough: boolean;
  selectionLink: boolean;
  selectionBulletedList: boolean;
  setSelectionBold: (value: boolean) => void;
  setSelectionItalic: (value: boolean) => void;
  setSelectionUnderline: (value: boolean) => void;
  setSelectionStrikethrough: (value: boolean) => void;
  setSelectionLink: (value: boolean) => void;
  setSelectionBulletedList: (value: boolean) => void;
  linkAnchorElement: HTMLElement | null;
  setLinkAnchorElement: (open?: boolean) => void;
  linkOperatorShow: boolean;
  setLinkOperatorShow: (value: boolean) => void;
  selectionLinkUrl: string;
  setSelectionLinkUrl: (value: string) => void;
}

export type NoteEditorStore = ReturnType<typeof createNoteEditorStore>;

export const createNoteEditorStore = () => {
  return createStore<State>((set, get) => ({
    selectionBold: false,
    selectionItalic: false,
    selectionUnderline: false,
    selectionStrikethrough: false,
    selectionLink: false,
    selectionBulletedList: false,
    setSelectionBold: (value) => set({ selectionBold: value }),
    setSelectionItalic: (value) => set({ selectionItalic: value }),
    setSelectionUnderline: (value) => set({ selectionUnderline: value }),
    setSelectionStrikethrough: (value) => set({ selectionStrikethrough: value }),
    setSelectionLink: (value) => set({ selectionLink: value }),
    setSelectionBulletedList: (value) => set({ selectionBulletedList: value }),
    linkAnchorElement: null,
    setLinkAnchorElement: (open = false) => {
      if (open) {
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const nativeSelection = window.getSelection();
            if (nativeSelection?.focusNode) {
              const parent = nativeSelection.focusNode.parentElement;
              set(() => ({ linkAnchorElement: parent }));
            }
          }
        }, 0);
      } else {
        set({ linkAnchorElement: null });
      }
    },
    linkOperatorShow: false,
    setLinkOperatorShow: (value) => set({ linkOperatorShow: value }),
    selectionLinkUrl: "",
    setSelectionLinkUrl: (value) => set({ selectionLinkUrl: value }),
  }));
}

export const useNoteEditorStore = function <T>(selector: (state: State) => T): T {
  const store = useContext(NoteEditorContext);
  if (!store) {
    throw new Error("NoteEditorStore is not initialized");
  }
  return useStore(store, selector);
}

export const useNoteEditorContext = () => {
  return useContext(NoteEditorContext);
}
