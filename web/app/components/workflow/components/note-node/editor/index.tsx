import type { EditorState } from 'lexical'
import { memo } from 'react';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/classnames';


type EditorProps = {
  placeholder?: string;
  onChange?: (editorState: EditorState) => void;
}

export const Editor = memo(({ placeholder, onChange }: EditorProps) => {
  const { t } = useTranslation();

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

  return (
    <div className='relative text-sm'>
      <RichTextPlugin
        placeholder={<PlaceHolder />}
        contentEditable={<ContentEditable className="min-h-[60px] w-full h-full text-text-secondary outline-none" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  );
});

export default Editor;