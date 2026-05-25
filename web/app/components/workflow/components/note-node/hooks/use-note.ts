import type { EditorState } from 'lexical'
import { useCallback } from "react"
import { NoteNodeTheme } from '../types';
import { useNodesUpdate } from '../../../hooks/use-nodesUpdate';

export const useNote = (id: string) => {
  const { onNodeDataUpdate } = useNodesUpdate();
  const onEditorChange = useCallback((editorState: EditorState) => {
    // Handle editor state change
    if (!editorState.isEmpty()) {
      const json = JSON.stringify(editorState.toJSON());
      onNodeDataUpdate({ id, data: { content: json } });
    } else {
      onNodeDataUpdate({ id, data: { content: '' } });
    }
  }, [id, onNodeDataUpdate]);

  const onThemeChange = useCallback((theme: NoteNodeTheme) => {
    // Handle theme change
    onNodeDataUpdate({ id, data: { theme } });
  }, [id, onNodeDataUpdate]);

  return {
    onEditorChange,
    onThemeChange,
  }
};

