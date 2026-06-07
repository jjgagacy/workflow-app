import { cn } from "@/utils/classnames";
import React from "react";
import { useToggleExpanded } from "../../../hooks/use-toggleExpand";

type Props = {
  className?: string;
  children?: React.ReactNode;
  minHeight?: number;
}

export const CodeEditorWrapper = ({
  className,
  children,
  minHeight = 200,
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const height = minHeight - 40; // 40px for title and padding
  const [editorContentHeight, setEditorContentHeight] = React.useState(height);
  const { toggleExpand, expanded, expandedHeight } = useToggleExpanded({ ref });

  return (
    <div className={cn(
      'relative h-full min-h-16',
      !expanded ? '' : 'absolute top-[40px] left-4 w-full z-10 bg-muted/15 p-4',
      className
    )}>
      <div ref={ref} className={cn(
        'relative h-full',
        !expanded ? `min-h-[${height}px]` : `min-h-[${expandedHeight}px]`,
      )}>
        <div className="overflow-y-auto" style={{ height: !expanded ? height : expandedHeight }}>
          <div className="h-full pb-2 pl-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
