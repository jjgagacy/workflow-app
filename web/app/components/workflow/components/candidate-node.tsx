import { useViewport } from "@xyflow/react";
import { useWorkflowStore } from "../context";
import { CUSTOM_NOTE_NODE_NAME } from "../constants";
import { CustomNoteNode } from "./note-node";

export const CandidateNode = () => {
  const mousePosition = useWorkflowStore(s => s.mousePosition);
  const candidateNode = useWorkflowStore(s => s.candidateNode);
  const zoom = useViewport();

  if (!candidateNode)
    return null;

  return (
    <div
      className="z-10 absolute"
      style={{ left: mousePosition.x, top: mousePosition.y, transform: `translate(-50%, -50%) scale(${zoom})` }}
    >
      {
        candidateNode.type === CUSTOM_NOTE_NODE_NAME && (
          <CustomNoteNode {...candidateNode as any} />
        )
      }
    </div>
  );
}
