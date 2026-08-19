import type { Node } from "../../types";
import type { IfElseNodeData } from "./types";
import { ConditionPanel } from "../../components/branch/condition-panel";

type IfElsePanelProps = {
  node: Node<IfElseNodeData>;
};

const IfElsePanel = ({ node }: IfElsePanelProps) => {
  return <ConditionPanel node={node} />;
};

export default IfElsePanel;
