import IfElseNode from "./if-else";
import IfElsePanel from "./if-else/panel";

export const NodeComponents: Record<string, React.FC<any>> = {
  'if-else': IfElseNode,
  // 'custom-node': CustomNode,
  // 'note-node': NoteNode,
};

export const NodePanels: Record<string, React.FC<any>> = {
  'if-else': IfElsePanel,
};