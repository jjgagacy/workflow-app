import type { Node } from "../../types";
import type { IfElseNodeData } from "./types";
import { SharedConditionPanel } from "../../components/nodes-shared/condition-panel";

type IfElsePanelProps = {
  node: Node<IfElseNodeData>;
};

const IfElsePanel = ({ node }: IfElsePanelProps) => {
  return <SharedConditionPanel node={node} />;
};

export default IfElsePanel;
