import { Node, NodeData } from "../../types";

export enum NoteNodeTheme {
  gold = 'gold',
  red = 'red',
  green = 'green',
  blue = 'blue',
  purple = 'purple',
  neutral = 'neutral',
}

export type NoteNodeData = NodeData & {
  content: string;
  theme: NoteNodeTheme;
}