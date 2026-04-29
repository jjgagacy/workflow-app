import { addEdge, applyEdgeChanges, applyNodeChanges, Background, ConnectionMode, Controls, DefaultEdgeOptions, MiniMap, OnNodeDrag, Panel, ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { ViewportWithAnnotation } from "./components/annotation";
import { useCallback, useEffect, useState } from "react";
import { TextUpdaterNode } from "./components/text-updater";
import { CustomNode } from "./components/custom-node";
import { CustomEdge } from "./components/custom-edge";
import { useAppearance } from "@/hooks/use-appearance";
import { CUSTOM_EDGE_NAME, CUSTOM_NODE_NAME } from "./constants";
import { initialNodes } from "./node";
import { initialEdges } from "./edge";
import { Edge, Node } from "./types";
import { WorkflowHistoryProvider } from "./store/workflow-history-store";

const customGetNodesBounds = (nodes: any[]) => {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + (node.measured?.width || 150));
    maxY = Math.max(maxY, node.position.y + (node.measured?.height || 40));
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

export type WorkflowBodyProps = {
  nodes: Node[];
  edges: Edge[];
  children: React.ReactNode;
}

export const WorkflowBody = ({ nodes: nodesData, edges: edgesData, children }: WorkflowBodyProps) => {
  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
  };

  // 在这里使用 useReactFlow 是安全的，因为这个组件会被放在 ReactFlowProvider 内部
  const { setViewport } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>(nodesData);
  const [edges, setEdges] = useState<Edge[]>(edgesData);
  const { activeTheme } = useAppearance();

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const nodeTypes = {
    [CUSTOM_NODE_NAME]: CustomNode,
    textUpdater: TextUpdaterNode,
  };

  const edgeTypes = {
    [CUSTOM_EDGE_NAME]: CustomEdge,
  };

  // 手动居中的 useEffect
  useEffect(() => {
    setTimeout(() => {
      const bounds = customGetNodesBounds(nodes);
      const container = document.querySelector('.react-flow');
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const newX = (containerWidth - bounds.width) / 2 - bounds.minX;
        const newY = (containerHeight - bounds.height) / 2 - bounds.minY;
        console.log('Centering viewport to:', { newX, newY });
        setViewport({ x: newX, y: newY, zoom: 1 });
      }
    }, 100);
  }, []);

  const onNodeDrag: OnNodeDrag = (_, node) => {
    console.log('drag event', node.data);
  };

  return (
    <div id="react-flow-body" className="relative w-full h-full">
      {children}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        colorMode={activeTheme === 'dark' ? 'dark' : 'light'}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <Panel position="top-left">
          <ViewportWithAnnotation />
        </Panel>
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}

export type WorkflowProps = {
  nodes: Node[];
  edges: Edge[];
  children: React.ReactNode;
}

const Workflow = ({ nodes, edges, children }: WorkflowProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowHistoryProvider nodes={nodes} edges={edges}>
        {children}
      </WorkflowHistoryProvider>
    </ReactFlowProvider>
  );
}

export default Workflow;