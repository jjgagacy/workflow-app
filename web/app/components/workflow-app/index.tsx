import Workflow, { WorkflowBody } from "../workflow";
import { WorkflowContextProvider } from "../workflow/context"
import { initialEdges } from "../workflow/edge";
import { initialNodes } from "../workflow/node";
import { Edge, Node } from "../workflow/types"
import { WorkflowContent } from "./components";

export const WorkflowApp = () => {
  const nodes: Node[] = initialNodes;
  const edges: Edge[] = initialEdges;

  return (
    <WorkflowContextProvider>
      <Workflow nodes={nodes} edges={edges}>
        <WorkflowBody nodes={nodes} edges={edges}>
          <WorkflowContent />
        </WorkflowBody>
      </Workflow>
    </WorkflowContextProvider>
  );
}
