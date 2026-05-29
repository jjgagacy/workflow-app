import { Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/utils/classnames";
import { useWorkflowStore } from "../context";
import { usePanelResize } from "./hooks/use-panel-resize";
import { TitleInput } from "./components/title-input";
import { useNodesUpdate } from "../hooks/use-nodesUpdate";
import { NodePanels } from "../nodes/types";

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border-b border-[var(--border)] py-3 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-foreground">{value}</span>
    </div>
  );
};

export const Panel = () => {
  const activePanel = useWorkflowStore((state) => state.activePanel);
  const panelMode = useWorkflowStore((state) => state.panelMode);
  const panelWidth = useWorkflowStore((state) => state.panelWidth);
  const closePanel = useWorkflowStore((state) => state.closePanel);
  const togglePanelMode = useWorkflowStore((state) => state.togglePanelMode);
  const setPanelWidth = useWorkflowStore((state) => state.setPanelWidth);
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { handleResizeStart } = usePanelResize({
    enabled: panelMode === "side",
    panelWidth,
    setPanelWidth,
  });

  if (!activePanel) {
    return null;
  }

  const isNodePanel = activePanel.type === "node";
  const node = activePanel.node;
  const NodePanelComponent = isNodePanel && node ? NodePanels[node.data.type] : null;
  const measuredWidth = node?.measured?.width ?? node?.width;
  const measuredHeight = node?.measured?.height ?? node?.height;
  const resolvedWidth = panelMode === "side"
    ? panelWidth
    : Math.min(Math.max(panelWidth + 80, 420), 760);
  const title = isNodePanel ? (node?.data.label || node?.id || activePanel.title) : activePanel.title;

  const handleTitleChange = (value: string) => {
    if (!node) {
      return;
    }

    const nextNode = {
      ...node,
      data: {
        ...node.data,
        label: value,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: {
        label: value,
      },
    });
  };

  return (
    <div
      className={cn(
        "absolute z-[60] flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-background shadow-2xl",
        panelMode === "side"
          ? "bottom-2 right-2 top-14"
          : "left-1/2 top-1/2 h-[min(80vh,720px)] -translate-x-1/2 -translate-y-1/2",
      )}
      style={{ width: resolvedWidth }}
    >
      {panelMode === "side" && (
        <div
          className="absolute bottom-0 left-0 top-0 z-10 w-2 -translate-x-1/2 cursor-col-resize"
          onPointerDown={handleResizeStart}
        />
      )}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="min-w-0">
          {isNodePanel && node ? (
            <TitleInput title={title} onChange={handleTitleChange} />
          ) : (
            <div className="truncate text-sm font-semibold text-foreground">{title}</div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">
            {isNodePanel ? "Node properties" : "Environment variables"}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={panelMode === "side" ? "Open dialog panel" : "Dock side panel"}
            onClick={togglePanelMode}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
          >
            {panelMode === "side" ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Close panel"
            onClick={closePanel}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-[var(--border)] hover:bg-muted/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isNodePanel && node ? (
          <>
            {NodePanelComponent ? (
              <div className="mt-4">
                <NodePanelComponent node={node} />
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {activePanel.payload && Object.keys(activePanel.payload).length
              ? `Showing ${Object.keys(activePanel.payload).length} public environment values.`
              : "No public environment variables are available in the client bundle."}
          </div>
        )}
      </div>
    </div>
  );
}

Panel.displayName = "Panel";

export default Panel;