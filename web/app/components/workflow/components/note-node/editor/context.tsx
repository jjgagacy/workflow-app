'use client';

import { createContext, useRef } from "react";
import { createNoteEditorStore, NoteEditorStore } from "./store";
import { LexicalComposer } from '@lexical/react/LexicalComposer';

export const NoteEditorContext = createContext<NoteEditorStore | null>(null);

type NoteEditorProviderProps = {
  children: React.ReactNode;
  initialValue?: string;
}

export const NoteEditorProvider = ({ children, initialValue }: NoteEditorProviderProps) => {
  const storeRef = useRef<NoteEditorStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createNoteEditorStore();
  }

  let value = undefined;
  if (initialValue) {
    try {
      value = JSON.parse(initialValue);
    } catch (error) {
      console.error("Failed to parse initial value for NoteEditorStore:", error);
    }
  }

  const initialConfig = {
    namespace: "NoteEditor",
    theme: {},
    nodes: [],
    editorState: !value?.root.children.length ? undefined : JSON.stringify(value),
    onError: (error: Error) => {
      console.error("Error in NoteEditor:", error);
      throw error;
    },
  }

  return (
    <NoteEditorContext.Provider value={storeRef.current}>
      <LexicalComposer initialConfig={initialConfig}>
        {children}
      </LexicalComposer>
    </NoteEditorContext.Provider>
  );
}

NoteEditorProvider.displayName = "NoteEditorProvider";

export default NoteEditorProvider;