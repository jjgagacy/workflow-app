import { NodeProps } from "@xyflow/react";
import { Node, NodeData } from "../../types"
import { useWorkflowContext, useWorkflowStore } from "../../context";
import { NoteNodeData } from "./types";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { cn } from "@/utils/classnames";
import NoteEditorProvider from "./editor/context";
import Editor from "./editor";
import { useNote } from "./hooks/use-note";
import { Toolbar } from "./editor/toolbar";
import { THEME_COLORS } from "./constants";


export const CustomNoteNode = ({ id, data }: NodeProps<Node<NoteNodeData>>) => {
  const candidateNode = useWorkflowStore(s => s.candidateNode);
  const { t } = useTranslation();
  const { handleEditorChange } = useNote(id);
  const theme = data.theme;
  const ref = useRef<HTMLDivElement | null>(null);
  data.size = data.size || { width: 200, height: 100 };

  if (!candidateNode)
    return null;

  return (
    <div
      className={cn(
        'relative flex flex-col items-start border border-gray-300 rounded-md bg-yellow-50',
        THEME_COLORS[theme]?.bg,
        THEME_COLORS[theme]?.border,
        data.selected && 'ring-2 ring-primary',
        // candidateNode.id === id && 'opacity-50 pointer-events-none'
      )}
      style={{
        width: data.size.width,
        height: data.size.height,
      }}
      ref={ref}
    >
      <NoteEditorProvider initialValue={data.content}>
        <div className="relative w-full h-full">
          {/* toolbar  */}
          {data.selected && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[-35px] z-10 flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-[var(--border)] text-xs group-hover:opacity-100 transition-opacity shadow-sm">
              <Toolbar
                theme={theme}
                onCopy={() => { }}
                onDelete={() => { }}
                onDuplicate={() => { }}
                onThemeChange={() => { }}
              />
            </div>
          )}
          {/* editor */}
          <div className="grow overflow-y-auto px-3 py-2.5">
            <div className={cn(
              data.selected && 'nodrag nopan nowheel cursor-text'
            )}>
              <Editor onChange={handleEditorChange} />
            </div>
          </div>
        </div>
      </NoteEditorProvider>
    </div>
  );
}
