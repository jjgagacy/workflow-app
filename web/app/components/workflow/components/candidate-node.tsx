import { useReactFlow, useStoreApi, useViewport } from "@xyflow/react";
import { useWorkflowContext, useWorkflowStore } from "../context";
import { CUSTOM_NOTE_NODE_NAME } from "../constants";
import { CustomNoteNode } from "./note-node";
import { useEventListener } from "ahooks";
import { produce } from "immer";
import { Node } from "../types";
import { NoteNodeData } from "./note-node/types";

export const CandidateNode = () => {
  const store = useStoreApi();
  const reactFlow = useReactFlow();
  const workflowStore = useWorkflowContext();
  const mousePosition = useWorkflowStore(s => s.mousePosition);
  const candidateNode = useWorkflowStore(s => s.candidateNode);
  const setCandidateNode = useWorkflowStore(s => s.setCandidateNode);
  const zoom = useViewport();

  useEventListener('click', (e) => {
    const { candidateNode } = workflowStore.getState();
    if (candidateNode) {
      e.preventDefault();
      const { nodes } = store.getState();
      const { screenToFlowPosition, addNodes } = reactFlow;
      const { x, y } = screenToFlowPosition({ x: mousePosition.x + mousePosition.offsetX, y: mousePosition.y + mousePosition.offsetY });
      const newNodes = produce(nodes, draft => {
        const { candidate, ...dataRest } = candidateNode.data as NoteNodeData;
        const newNode: Node = {
          ...candidateNode,
          data: {
            ...(dataRest),
          },
          position: { x, y },
        }
        draft.push(newNode);
      });
      addNodes(newNodes);
      setCandidateNode(undefined);
    }
  });

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
