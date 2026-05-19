import { StateCreator } from "zustand";
import { Node } from "../../types"

export type NodeState = {
  candidateNode: Node | null;
  setCandidateNode: (node: Node) => void;
}

export const createNodeState: StateCreator<NodeState> = (set, get) => ({
  candidateNode: null,
  setCandidateNode: (node: Node) => set({ candidateNode: node }),
});

