import { NodeProps } from '@xyflow/react';
import { Node, NodeData } from '../types';
import { BaseNode } from '../nodes';

export function CustomNode(props: NodeProps<Node<NodeData>> & { children?: React.ReactNode }) {
  return (
    <BaseNode {...props}>
      {props.children}
    </BaseNode>
  );
}