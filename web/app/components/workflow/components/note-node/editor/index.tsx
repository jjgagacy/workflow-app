import type { EditorState } from 'lexical'
import { memo } from 'react';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/classnames';
import { useFormatChange } from '../hooks/use-format-change';
import { useNodesUpdate } from '../../../hooks/nodes/use-nodesUpdate';
import { LinkEditorComponent } from '../plugins/link-editor/component';
import LinkEditorPlugin from '../plugins/link-editor';


type EditorProps = {
  placeholder?: string;
  onChange?: (editorState: EditorState) => void;
  containerElement: HTMLDivElement | null;
}

export const Editor = memo(({ placeholder, onChange, containerElement }: EditorProps) => {
  const { t } = useTranslation();
  useFormatChange();

  const { onNodeDataUpdate } = useNodesUpdate();

  const PlaceHolder = () => {
    return (
      <div className={cn(
        'pointer-events-none absolute left-0 top-0 w-full h-full select-none text-text-secondary',
        'overflow-hidden'
      )}>
        {placeholder || t('workflow.note-node.placeholder')}
      </div>
    );
  }

  const handleEditorChange = (editorState: EditorState) => {
    if (onChange) {
      onChange(editorState);
    }
  }

  return (
    <div className='relative text-sm'>
      <RichTextPlugin
        placeholder={<PlaceHolder />}
        contentEditable={<ContentEditable className="min-h-[60px] w-full h-full text-text-secondary outline-none" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <LinkPlugin />
      <ClickableLinkPlugin disabled={true} />
      <ListPlugin />
      <HistoryPlugin />
      <LinkEditorPlugin containerElement={containerElement} />
      <OnChangePlugin onChange={handleEditorChange} />
    </div>
  );
});

export default Editor;