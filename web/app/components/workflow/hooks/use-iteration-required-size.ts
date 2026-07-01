import { useMemo } from 'react';
import { NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH, NODE_RESIZE_MIN_HEIGHT, NODE_RESIZE_MIN_WIDTH } from '../constants';
import type { Node } from '../types';

const ITERATION_HEADER_HEIGHT = 48;
const ITERATION_HORIZONTAL_PADDING = 20;
const ITERATION_BOTTOM_PADDING = 20;

type NodeSize = {
  width?: number;
  height?: number;
};

type UseIterationRequiredSizeProps = {
  childNodes: Node[];
  size?: NodeSize;
};

export const useIterationRequiredSize = ({ childNodes, size }: UseIterationRequiredSizeProps) => {
  return useMemo(() => {
    const baseWidth = Math.max(size?.width || NODE_DEFAULT_WIDTH, NODE_RESIZE_MIN_WIDTH);
    const baseHeight = Math.max(size?.height || NODE_DEFAULT_HEIGHT, NODE_RESIZE_MIN_HEIGHT);

    if (!childNodes.length) {
      return { width: baseWidth, height: baseHeight };
    }

    const contentWidth = childNodes.reduce((maxWidth, childNode) => {
      const childWidth = childNode.measured?.width ?? childNode.width ?? childNode.data?.size?.width ?? NODE_DEFAULT_WIDTH;
      return Math.max(maxWidth, childNode.position.x + childWidth + ITERATION_HORIZONTAL_PADDING);
    }, NODE_RESIZE_MIN_WIDTH);

    const contentHeight = childNodes.reduce((maxHeight, childNode) => {
      const childHeight = childNode.measured?.height ?? childNode.height ?? childNode.data?.size?.height ?? NODE_DEFAULT_HEIGHT;
      return Math.max(maxHeight, childNode.position.y + childHeight + ITERATION_BOTTOM_PADDING);
    }, ITERATION_HEADER_HEIGHT + NODE_RESIZE_MIN_HEIGHT);

    return {
      width: Math.max(baseWidth, contentWidth),
      height: Math.max(baseHeight, contentHeight),
    };
  }, [childNodes, size?.height, size?.width]);
};