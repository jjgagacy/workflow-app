import { useCallback } from "react"
import { useWorkflowContext, useWorkflowStore } from "../context"
import { newCandidateNode } from "../utils/node";
import { CUSTOM_NOTE_NODE_NAME, NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH } from "../constants";
import { NoteNodeData, NoteNodeTheme } from "../components/note-node/types";

export const useAddNote = () => {
  const workflowStore = useWorkflowContext();

  const addNote = useCallback(() => {
    const newNode = newCandidateNode({
      type: CUSTOM_NOTE_NODE_NAME,
      data: {
        label: "",
        description: "",
        type: '' as any,
        content: "",
        size: { width: NODE_DEFAULT_WIDTH, height: NODE_DEFAULT_HEIGHT },
        candidate: true,
        theme: NoteNodeTheme.gold,
      } as NoteNodeData,
      position: {
        x: 0,
        y: 0
      }
    });
    workflowStore.setState({ candidateNode: newNode });
  }, [workflowStore]);

  return { addNote };
}