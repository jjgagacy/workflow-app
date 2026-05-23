import { NodeProps, useReactFlow, useStoreApi } from "@xyflow/react";
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
import NodeResizer from "../node-resizer";
import { Grip } from "lucide-react";
import { useInteractions } from "../../hooks/nodes/use-interactions";


export const CustomNoteNode = ({ id, data }: NodeProps<Node<NoteNodeData>>) => {
  // const candidateNode = useWorkflowStore(s => s.candidateNode);
  const { t } = useTranslation();
  const { onEditorChange, onThemeChange } = useNote(id);
  const { handleNodeDelete } = useInteractions();
  const theme = data.theme;
  const ref = useRef<HTMLDivElement | null>(null);
  const store = useStoreApi();
  const { nodes } = store.getState();
  const node = nodes.find(n => n.id === id);

  return (
    <div
      className={cn(
        'relative flex flex-col items-start border border-[var(--border)] rounded-md hover:shadow-lg hover:ring-1 hover:ring-gray-200 transition-colors',
        THEME_COLORS[theme]?.bg,
        THEME_COLORS[theme]?.border,
        // node?.selected && 'ring-2 ring-primary',
      )}
      style={{
        width: data?.size?.width || 200,
        height: data?.size?.height || 100,
      }}
      ref={ref}
    >
      <NoteEditorProvider initialValue={data.content}>
        <div className="relative w-full h-full">
          {/* node resizer  */}
          <NodeResizer
            id={id}
            nodeData={data}
            icon={<Grip className="w-3 h-3 text-gray-400 dark:text-gray-600" />}
          />
          {/* toolbar  */}
          {node?.selected && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[-35px] z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-[var(--border)] text-xs group-hover:opacity-100 transition-opacity shadow-sm">
              <Toolbar
                theme={theme}
                onCopy={() => { }}
                onDelete={() => handleNodeDelete(id)}
                onDuplicate={() => { }}
                onThemeChange={onThemeChange}
              />
            </div>
          )}
          {/* editor */}
          <div className="grow overflow-y-auto px-3 py-2.5 h-full">
            <div className={cn(
              node?.selected && 'nodrag nopan nowheel cursor-text'
            )}>
              <Editor onChange={onEditorChange} containerElement={ref.current} />
            </div>
          </div>
          <div className='p-3 pt-0'></div>
        </div>
      </NoteEditorProvider>
    </div>
  );
}
