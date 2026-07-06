import { useTranslation } from "react-i18next";
import { useWorkflowStore } from "../../context";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { Node } from "../../types";
import { ScheduleNodeData } from "./type";

type SchedulePanelProps = {
  node: Node<ScheduleNodeData>;
};

const ScheduleNodePanel = ({ node }: SchedulePanelProps) => {
  const { t } = useTranslation();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();

  return (
    <div className="space-y-0">
    </div>
  );
}

export default ScheduleNodePanel;