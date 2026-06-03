import { useReactFlow, useStoreApi, useViewport } from "@xyflow/react";
import { useWorkflowContext, useWorkflowStore } from "../context";
import { CUSTOM_NOTE_NODE_NAME } from "../constants";
import { CustomNoteNode } from "./note-node";
import { useEventListener } from "ahooks";
import { produce } from "immer";
import { Node } from "../types";
import { NoteNodeData } from "./note-node/types";
import { CustomNode } from "./custom-node";
import { useWorkflowHistory, WorkflowHistoryEvent } from "../hooks/use-workflow-history";

export const CandidateNode = () => {
  const store = useStoreApi<Node, import("../types").Edge>();
  const reactFlow = useReactFlow<Node, import("../types").Edge>();
  const workflowStore = useWorkflowContext();
  const mousePosition = useWorkflowStore(s => s.mousePosition);
  const candidateNode = useWorkflowStore(s => s.candidateNode);
  const setCandidateNode = useWorkflowStore(s => s.setCandidateNode);
  const { addHistoryState } = useWorkflowHistory();
  const zoom = useViewport();

  useEventListener('click', (e) => {
    const { candidateNode } = workflowStore.getState();
    if (candidateNode) {
      e.preventDefault();
      const { nodes, edges } = store.getState();
      const { screenToFlowPosition, setNodes } = reactFlow;
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
      setNodes(newNodes);
      setCandidateNode(undefined);
      const historyEvent = candidateNode.type === CUSTOM_NOTE_NODE_NAME ? WorkflowHistoryEvent.NoteAdd : WorkflowHistoryEvent.NodeAdd;
      addHistoryState(historyEvent, { nodes: newNodes, edges });
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
        candidateNode.type !== CUSTOM_NOTE_NODE_NAME && (
          <CustomNode {...candidateNode as any} />
        )
      }
      {
        candidateNode.type === CUSTOM_NOTE_NODE_NAME && (
          <CustomNoteNode {...candidateNode as any} />
        )
      }
    </div>
  );
}
