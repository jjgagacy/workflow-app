import { NodeProps } from "@xyflow/react";
import type { Node } from "../../types";
import { NodeHeader } from "../../components/nodes-shared";
import { useTranslation } from "react-i18next";
import { getNodeTypeIconColor } from "../../utils/node";
import { ScheduleNodeData } from "./type";

const ScheduleNode = ({ id, data }: NodeProps<Node<ScheduleNodeData>>) => {
  const { t } = useTranslation();
  const label = data.label?.trim() || t('workflow.nodes.schedule.name');
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);

  return (
    <div className="schedule-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
        </>
      )}
    </div>
  );
}

export default ScheduleNode;