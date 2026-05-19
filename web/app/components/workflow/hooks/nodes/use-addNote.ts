import { useCallback } from "react"
import { useWorkflowContext, useWorkflowStore } from "../../context"
import { newCandidateNode } from "../../utils/node";
import { CUSTOM_NODE_NAME, CUSTOM_NOTE_NODE_NAME } from "../../constants";
import { NoteNodeData, NoteNodeTheme } from "../../components/note-node/types";

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
        size: { width: 200, height: 100 },
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