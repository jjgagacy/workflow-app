import { cn } from "@/utils/classnames";
import React from "react";
import { useToggleExpanded } from "../../../hooks/use-toggleExpand";
import { EDITOR_MIN_HEIGHT } from "../data";
import { EditorResizeHeight } from "./resizeHeight";
import { CodeGenerate } from "./code-generate";
import { ToggleExpandBtn } from "@/app/components/base/toggle-expand-btn";
import { useWorkflowStore } from "../../../context";

type Props = {
  className?: string;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  minHeight?: number;
}

export const CodeEditorWrapper = ({
  className,
  title,
  children,
  minHeight = EDITOR_MIN_HEIGHT,
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const height = minHeight - 40; // 40px for title and padding
  const { toggleExpand, expanded, expandedHeight } = useToggleExpanded({ ref });
  const contentMinHeight = expanded ? Math.max(expandedHeight, height) : height;
  const panelMode = useWorkflowStore((state) => state.panelMode);
  const panelWidth = useWorkflowStore((state) => state.panelWidth);

  return (
    <div
      className={cn(
        'relative flex h-full min-h-16 flex-col rounded-md border border-[var(--border)] bg-background',
        expanded && 'z-[100] bg-background m-0 rounded-none border-0',
        className
      )}
      style={expanded ? {
        position: 'fixed' as const,
        width: panelMode === 'side' ? `${panelWidth}px` : '100%',
        right: 0,
        top: panelMode === 'side' ? '88px' : '30px',
        bottom: 0,
      } : {}}
    >
      <div className={cn(
        'flex items-center justify-between px-4 py-2 pt-1',
        expanded && 'px-6 py-4'
      )}>
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="flex items-center gap-2">
          <div className="ml-1">
            <CodeGenerate />
          </div>
          <ToggleExpandBtn expanded={expanded} onChange={toggleExpand} />
        </div>
      </div>
      <div
        ref={ref}
        className={cn(
          'relative flex-1 min-h-0',
        )}
        style={{ minHeight: `${contentMinHeight}px` }}
      >
        {!expanded ? (
          <EditorResizeHeight>
            <div className="h-full pb-2 pl-2">
              {children}
            </div>
          </EditorResizeHeight>
        ) : (
          <div className="h-full pb-2 pl-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
