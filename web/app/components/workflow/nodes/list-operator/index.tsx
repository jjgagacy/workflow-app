import { NodeProps } from "@xyflow/react";
import { NodeSourceHandle } from "../../components/handle/node-source-handle";
import { NodeHeader } from "../../components/nodes-shared";
import type { Node } from "../../types";
import { getNodeTypeIconColor } from "../../utils/node";
import { normalizeListOperatorConditions } from "./data";
import type { ListOperatorNodeData } from "./types";

const ListOperatorNode = ({ id, data }: NodeProps<Node<ListOperatorNodeData>>) => {
  const label = data.label?.trim() || 'List Operator';
  const iconColor = data.iconColor || getNodeTypeIconColor(data.type);
  const inputVariable = data.inputVariable?.trim() || '未选择数组变量';
  const conditions = normalizeListOperatorConditions(data.conditions);
  const firstN = Math.max(0, Number(data.firstN) || 0);
  const lastN = Math.max(0, Number(data.lastN) || 0);
  const enableSort = Boolean(data.enableSort);
  const sortOrder = data.sortOrder === 'desc' ? 'DESC' : 'ASC';
  const outputVariableName = data.outputVariableName?.trim() || 'listResult';

  return (
    <div className="list-operator-node relative">
      <NodeHeader icon={data.icon} iconColor={iconColor} title={label} />
      {!data.candidate && (
        <>
          <div className="space-y-2 p-4">
            <div className="rounded-lg border border-[var(--border)] bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-2.5 py-1">{inputVariable}</span>
                <span className="rounded-full bg-background px-2.5 py-1">过滤条件 {conditions.length}</span>
                <span className="rounded-full bg-background px-2.5 py-1">前N {firstN}</span>
                <span className="rounded-full bg-background px-2.5 py-1">后N {lastN}</span>
                <span className="rounded-full bg-background px-2.5 py-1">
                  {enableSort ? `排序 ${sortOrder}` : '不排序'}
                </span>
              </div>
              <div className="mt-2 truncate">输出变量: {outputVariableName}</div>
            </div>
          </div>
          <NodeSourceHandle nodeId={id} handleId="output" />
        </>
      )}
    </div>
  );
};

export default ListOperatorNode;
