import Workflow, { WorkflowBody } from "../workflow";
import { WorkflowContextProvider } from "../workflow/context"
import { initialEdges } from "../workflow/edge";
import { initialNodes } from "../workflow/node";
import { Edge, Node } from "../workflow/types"
import { WorkflowUpdateParams } from "../workflow/types";
import { WorkflowContent } from "./components";
import { useWorkflowInit } from "../workflow/hooks/use-workflowInit";
import { useEffect, useMemo } from "react";
import { prepareEdges, prepareNodes } from "../workflow/utils/node";
import Loading from "../base/loading";
import { useWorkflowNodes } from "../workflow/hooks/use-workflowNodes";

const WorkflowAppContent = () => {
  // const nodes: Node[] = initialNodes;
  // const edges: Edge[] = initialEdges;
  const { workflowDraft, isLoading } = useWorkflowInit();

  const nodes = useMemo(() => {
    if (workflowDraft) {
      const nodes = prepareNodes(workflowDraft.graph.nodes || [], workflowDraft.graph.edges || []);
      console.log('nodes', nodes)
      return nodes;
    }
    return [];
  }, [workflowDraft]);

  const edges = useMemo(() => {
    if (workflowDraft) {
      const edges = prepareEdges(workflowDraft.graph.nodes || [], workflowDraft.graph.edges || []);
      console.log('edges', edges);
      return edges;
    }
    return [];
  }, [workflowDraft]);

  if (isLoading) {
    return (
      <div className='relative flex h-full w-full items-center justify-center'>
        <Loading />
      </div>
    );
  }

  return (
    <Workflow nodes={nodes} edges={edges}>
      <WorkflowBody nodes={nodes} edges={edges}>
        <WorkflowContent />
      </WorkflowBody>
    </Workflow>
  );
};

export const WorkflowApp = () => {
  return (
    <WorkflowContextProvider>
      <WorkflowAppContent />
    </WorkflowContextProvider>
  );
};
