import IfElseNode from "./if-else";
import IfElsePanel from "./if-else/panel";
import FilterNode from "./filter";
import FilterPanel from "./filter/panel";
import IterationNode from "./iteration";
import IterationPanel from "./iteration/panel";

export const NodeComponents: Record<string, React.FC<any>> = {
  iteration: IterationNode,
  'if-else': IfElseNode,
  filter: FilterNode,
  // 'custom-node': CustomNode,
  // 'note-node': NoteNode,
};

export const NodePanels: Record<string, React.FC<any>> = {
  iteration: IterationPanel,
  'if-else': IfElsePanel,
  filter: FilterPanel,
};