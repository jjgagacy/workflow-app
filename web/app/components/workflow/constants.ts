import { ifElseNodeDefaultData } from "./nodes/if-else/data";
import { filterNodeDefaultData } from "./nodes/filter/data";
import type { IfElseNodeData } from "./nodes/if-else/types";
import type { FilterNodeData } from "./nodes/filter/types";
import type { IterationNodeData } from "./nodes/iteration/types";
import type { NodeData } from "./types";
import { NodeType } from "./types";

export const CUSTOM_NODE_NAME = 'customNode';
export const CUSTOM_EDGE_NAME = 'customEdge';

export const CUSTOM_NOTE_NODE_NAME = 'customNoteNode';
export const CUSTOM_SIMPLE_NODE_NAME = 'customSimpleNode';

export const NODE_RESIZE_MIN_WIDTH = 200;
export const NODE_RESIZE_MIN_HEIGHT = 90;

export const NODE_DEFAULT_WIDTH = 200;
export const NODE_DEFAULT_HEIGHT = 88;

type NodeDefaultDataByType = Partial<Record<NodeType, Partial<NodeData>>> & {
  [NodeType.IfElse]: Partial<IfElseNodeData>;
  [NodeType.Filter]: Partial<FilterNodeData>;
  [NodeType.Iteration]: Partial<IterationNodeData>;
};

export const NODE_DEFAULT_DATA: NodeDefaultDataByType = {
  [NodeType.IfElse]: {
    type: NodeType.IfElse,
    label: '',
    ...ifElseNodeDefaultData.value,
  },
  [NodeType.Filter]: {
    type: NodeType.Filter,
    label: '',
    ...filterNodeDefaultData.value,
  },
  [NodeType.Iteration]: {
    type: NodeType.Iteration,
    label: '',
    parallelCount: 1,
    errorResponse: 'stop-workflow',
    flat: false,
    size: {
      width: 320,
      height: 220,
    },
  },
};