import { cn } from "@/utils/classnames";
import { Redo2, Undo2 } from "lucide-react";
import { useContext } from "react";
import { useStore } from "zustand";
import { ShortcutTooltip } from "../../base/tooltip/shortcut";
import { WorkflowHistoryContext } from "../store/workflow-history-store";
import { useWorkflowInteractions } from "../hooks/use-interactions";

export const UndoRedo = () => {
  const historyStore = useContext(WorkflowHistoryContext);
  if (!historyStore) {
    throw new Error("UndoRedo must be used within a WorkflowHistoryProvider");
  }

  const { store } = historyStore;

  const { handleHistoryRedo, handleHistoryUndo } = useWorkflowInteractions();
  const canUndo = useStore(store.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(store.temporal, (state) => state.futureStates.length > 0);

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-background/95 p-1 shadow-md backdrop-blur-sm">
      <ShortcutTooltip label="返回" shortcut={{ keys: ['Z'], metaKey: true }} placement="top">
        <button
          type="button"
          aria-label="返回"
          disabled={!canUndo}
          onClick={(event) => {
            event.stopPropagation();
            handleHistoryUndo();
          }}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-sm border border-transparent transition-colors',
            canUndo
              ? 'cursor-pointer text-foreground hover:border-[var(--border)] hover:bg-muted'
              : 'cursor-not-allowed text-muted-foreground opacity-50'
          )}
        >
          <Undo2 className="h-4 w-4" />
        </button>
      </ShortcutTooltip>
      <ShortcutTooltip label="前进" shortcut={{ keys: ['Z'], shiftKey: true }} placement="top">
        <button
          type="button"
          aria-label="前进"
          disabled={!canRedo}
          onClick={(event) => {
            event.stopPropagation();
            handleHistoryRedo();
          }}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-sm border border-transparent transition-colors',
            canRedo
              ? 'cursor-pointer text-foreground hover:border-[var(--border)] hover:bg-muted'
              : 'cursor-not-allowed text-muted-foreground opacity-50'
          )}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </ShortcutTooltip>
    </div>
  );
}