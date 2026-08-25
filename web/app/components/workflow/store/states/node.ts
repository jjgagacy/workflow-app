import { StateCreator } from "zustand";
import { Node } from "../../types"

export type NodeState = {
  candidateNode: Node | null;
  setCandidateNode: (node: Node | undefined) => void;
  connectingNodeState?: { nodeId: string; nodeType: string; handleId: string; handleType: string };
  setConnectingNodeState: (info: NodeState['connectingNodeState']) => void;
}

export const createNodeState: StateCreator<NodeState> = (set, get) => ({
  candidateNode: null,
  setCandidateNode: (node: Node | undefined) => set({ candidateNode: node }),
  connectingNodeState: undefined,
  setConnectingNodeState: (info: NodeState['connectingNodeState']) => set({ connectingNodeState: info }),
});

