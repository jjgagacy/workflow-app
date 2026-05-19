import type { EditorState } from 'lexical'
import { useCallback } from "react"

export const useNote = (id: string) => {
  const handleEditorChange = useCallback((editorState: EditorState) => {
    // Handle editor state change
  }, []);

  return {
    handleEditorChange,
  }
};

