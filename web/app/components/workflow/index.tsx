import { applyEdgeChanges, applyNodeChanges, Background, ConnectionMode, Controls, DefaultEdgeOptions, MiniMap, OnNodeDrag, Panel, ReactFlow, ReactFlowProvider, useNodesState, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextUpdaterNode } from "./components/text-updater";
import { CustomNode } from "./components/custom-node";
import { CustomEdge } from "./components/custom-edge";
import { useAppearance } from "@/hooks/use-appearance";
import { CUSTOM_EDGE_NAME, CUSTOM_NODE_NAME, CUSTOM_NOTE_NODE_NAME } from "./constants";
import { Edge, Node } from "./types";
import { WorkflowHistoryProvider } from "./store/workflow-history-store";
import { Control } from "./operator/control";
import { Sidebar } from "./operator/sidebar";
import { useWorkflowStore } from "./context";
import { NodeListSelector } from "./components/nodeListSelector";
import { SlideTransition } from "../base/transition/slide-transition";
import { useNodeSelectorClose } from "./hooks/use-nodeSelectorClose";
import { useKeyboardShortcut } from "./hooks/use-keyboardShortcut";
import { SearchCommandPalette } from "./components/command/search-palette";
import { testPaletteItems } from "./components/command/palette/data";
import { ContextMenu } from "./contextmenu";
import { usePanelContextMenu } from "./hooks/use-panelMenu";
import { useNodeContextMenu } from "./hooks/use-nodeMenu";
import { NodeContextMenu } from "./contextmenu/node";
import { useSelectionContextMenu } from "./hooks/use-selectionMenu";
import { SelectionContextMenu } from "./contextmenu/selection";
import { CandidateNode } from "./components/candidate-node";
import { CustomNoteNode } from "./components/note-node";
import { useEventListener } from "ahooks";
import { setAutoFreeze } from "immer";
import { useWorkflowShortcut } from "./hooks/use-workflowShortcut";
import { useWorkflowInteractions } from "./hooks/use-interactions";
import { Tools } from "./components/tools";
import { useWorkflow } from "./hooks/use-workflow";
import { Operator } from "./operator";

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
    type: CUSTOM_EDGE_NAME,
    animated: false,
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const { workflowReadonly } = useWorkflow();

  // 在这里使用 useReactFlow 是安全的，因为这个组件会被放在 ReactFlowProvider 内部
  const { setViewport } = useReactFlow();
  const [nodes, setNodes] = useNodesState(nodesData);
  const [edges, setEdges] = useState<Edge[]>(() =>
    edgesData.map((edge) => ({
      ...edge,
      type: edge.type ?? CUSTOM_EDGE_NAME,
    }))
  );
  const { activeTheme } = useAppearance();
  const showSidebar = useWorkflowStore(s => s.showSidebar);
  const setShowSidebar = useWorkflowStore(s => s.setShowSidebar);
  const showNodeSelector = useWorkflowStore(s => s.showNodeSelector);
  const setShowNodeSelector = useWorkflowStore(s => s.setShowNodeSelector);
  const showCommandPalette = useWorkflowStore(s => s.showCommandPalette);
  const setShowCommandPalette = useWorkflowStore(s => s.setShowCommandPalette);
  const interactionMode = useWorkflowStore(s => s.interactionMode);
  const setMousePosition = useWorkflowStore(s => s.setMousePosition);
  const nodeSelectorWrapperRef = useRef<HTMLDivElement>(null);
  const pendingEdgeChangesRef = useRef<any[] | null>(null);
  const { handleContextMenu, handleCancelContextMenu } = usePanelContextMenu(containerRef);
  const { handleNodeContextMenu, handleCancelNodeContextMenu } = useNodeContextMenu(containerRef);
  const { handleSelectionContextMenu, handleCancelSelectionContextMenu } = useSelectionContextMenu(containerRef);
  const {
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handleNodeMouseMove,
    handleNodeClick,
    handleEdgeEnter,
    handleEdgeLeave,
    handleConnect,
    handleConnectStart,
    handleConnectEnd,
    handleNodeDoubleClick,
    handleNodeDrag,
    handleNodeDragStart,
    handleNodeDragStop,
    handleNodeSelectionChange,
    handleNodeSelectionDrag,
    handleNodeSelectionDragStart,
    handleNodeSelectionDragStop,
    handleNodeSelectionStart,
    handleNodeSelectionEnd,
    handleEdgesChange,
  } = useWorkflowInteractions();

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      pendingEdgeChangesRef.current = changes;
      const nextEdges = applyEdgeChanges(changes, edges);
      setEdges(nextEdges);
    },
    [edges, handleEdgesChange],
  );

  useEffect(() => {
    const pendingChanges = pendingEdgeChangesRef.current;
    if (!pendingChanges?.length)
      return;

    pendingEdgeChangesRef.current = null;
    handleEdgesChange(pendingChanges, edges);
  }, [edges, handleEdgesChange]);

  const nodeTypes = {
    [CUSTOM_NODE_NAME]: CustomNode,
    [CUSTOM_NOTE_NODE_NAME]: CustomNoteNode,
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
        setViewport({ x: newX, y: newY, zoom: 1 });
      }
    }, 100);
  }, []);

  const onNodeDrag: OnNodeDrag = (_, node) => {
  };

  useNodeSelectorClose(showNodeSelector, setShowNodeSelector, nodeSelectorWrapperRef);
  useKeyboardShortcut('n', () => {
    setShowNodeSelector(true);
  }, { ctrlKey: false });
  useKeyboardShortcut('k', () => setShowCommandPalette(!showCommandPalette), { ctrlKey: false });

  useEventListener('mousemove', (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y, offsetX: rect.left, offsetY: rect.top });
    }
  });

  useEffect(() => {
    setAutoFreeze(false);
    return () => {
      setAutoFreeze(true);
    };
  }, []);

  useWorkflowShortcut();

  // console.log('render workflow body', { nodes, edges });

  return (
    <div id="react-flow-body" className="relative flex w-full h-full overflow-hidden">
      <div className="relative flex w-full h-full" ref={containerRef}>
        {children}
        <Operator />
        <ContextMenu containerRef={containerRef} />
        <NodeContextMenu containerRef={containerRef} />
        <SelectionContextMenu containerRef={containerRef} />
        <CandidateNode />
        <div className="absolute right-4 top-4 flex w-12 items-center justify-center z-50 p-1 pr-2 min-h-5">
          <Control />
        </div>
        <ReactFlow
          className={`w-full h-full relative z-0 ${interactionMode === 'hand' ? 'cursor-grab' : 'cursor-default'}`}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          colorMode={activeTheme === 'dark' ? 'dark' : 'light'}
          defaultEdgeOptions={defaultEdgeOptions}
          panOnDrag={interactionMode === 'hand' && !workflowReadonly()}
          selectionOnDrag={interactionMode === 'pointer' && !workflowReadonly()}
          nodesDraggable={interactionMode === 'pointer' && !workflowReadonly()}
          elementsSelectable={interactionMode === 'pointer' && !workflowReadonly()}
          multiSelectionKeyCode={null}
          nodesFocusable={!workflowReadonly()}
          edgesFocusable={!workflowReadonly()}
          zoomOnPinch={!workflowReadonly()}
          zoomOnScroll={!workflowReadonly()}
          zoomOnDoubleClick={!workflowReadonly()}
          panOnScroll={!workflowReadonly()}
          onPaneContextMenu={handleContextMenu as any}
          onNodeContextMenu={handleNodeContextMenu as any}
          onSelectionContextMenu={handleSelectionContextMenu as any}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onNodeMouseMove={handleNodeMouseMove}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeDrag={handleNodeDrag}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          onSelectionChange={handleNodeSelectionChange}
          onSelectionDrag={handleNodeSelectionDrag}
          onSelectionDragStart={handleNodeSelectionDragStart}
          onSelectionDragStop={handleNodeSelectionDragStop}
          onSelectionEnd={handleNodeSelectionEnd}
          onSelectionStart={handleNodeSelectionStart}
          onEdgeMouseEnter={handleEdgeEnter}
          onEdgeMouseLeave={handleEdgeLeave}
          minZoom={0.25}
        >
          <Background
            gap={[14, 14]}
            size={2}
            color="var(--color-workflow-color)"
            bgColor="var(--color-workflow-bg)"
          />
          <Panel position="top-left">
            <Tools />
          </Panel>
          <MiniMap
            color="var(--color-workflow-color)"
            bgColor="var(--color-workflow-bg)"
            maskColor="var(--color-workflow-mask-color)"
            nodeBorderRadius={5}
            style={{ width: 120, height: 80 }}
            zoomable
            pannable />
        </ReactFlow>
        <SlideTransition show={showNodeSelector}>
          <div ref={nodeSelectorWrapperRef}>
            <NodeListSelector />
          </div>
        </SlideTransition>
      </div>
      {showSidebar && <Sidebar />}
      {showCommandPalette &&
        <SearchCommandPalette
          items={testPaletteItems}
          onClose={() => setShowCommandPalette(false)}
        />}
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