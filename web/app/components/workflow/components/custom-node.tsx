import { Position, Handle, NodeProps } from '@xyflow/react';
import { Node } from '../types';

export type CustomNode = Node<{
  value: number;
}>

export function CustomNode({ id, data }: NodeProps<CustomNode>) {
  return (
    <div className="custom-node">
      <div>Custom Node Content</div>
      <div>Value: {data.value}</div>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} id="a" />
      <Handle type="target" position={Position.Left} id="b" />
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Bottom} id="c" style={{ left: 10 }} />
    </div>
  );
}