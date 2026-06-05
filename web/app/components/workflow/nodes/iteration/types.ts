import { NodeData } from "../../types";
import type { WorkflowNodeErrorResponse } from "../../components/nodes-shared/execution-config";

export type IterationNodeData = NodeData<{
  parallelCount?: number;
  errorResponse?: WorkflowNodeErrorResponse;
  flat?: boolean;
}>;