'use client';
import { ASSETS_URL, BASE_URL } from '@/config';
import Editor, { loader } from '@monaco-editor/react'
import { CodeLanguage } from '../../types';
import { languages } from './types';
import { cn } from '@/utils/classnames';
import { CodeEditorWrapper } from './components/wrapper';
import React, { useMemo } from 'react';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { useTheme } from 'next-themes';

export type EditorType = editor.IStandaloneCodeEditor;
export type MonacoType = typeof monaco;

loader.config({ paths: { vs: `${ASSETS_URL}/editor/vs` } });

export type Props = {
  value?: string;
  title?: string;
  readonly?: boolean;
  language: CodeLanguage;
  className?: string;
  onChange?: (value: string) => void;
  onMounted?: (editor: EditorType, monaco: MonacoType) => void;
}

export const CodeEditor = ({
  value,
  title,
  readonly,
  language,
  className,
  onChange,
  onMounted,
}: Props) => {
  const [mounted, setMounted] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const { resolvedTheme, theme } = useTheme();
  console.log('CodeEditor theme', { resolvedTheme, theme });

  const editorRef = React.useRef<EditorType | null>(null);

  const handleChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value || '');
    }
  };

  const handleMounted = (editor: EditorType, monaco: MonacoType) => {
    editorRef.current = editor;

    editor.onDidFocusEditorText(() => {
      setFocus(true);
    });

    editor.onDidBlurEditorText(() => {
      setFocus(false);
    });

    const appliedTheme = (resolvedTheme || theme) === 'dark' ? 'vs-dark' : 'light';
    monaco.editor.setTheme(appliedTheme);

    onMounted?.(editor, monaco);
    setMounted(true);
  }

  const currentTheme = useMemo(() => {
    if ((resolvedTheme || theme) === 'dark')
      return 'vs-dark';
    return 'light';
  }, [resolvedTheme, theme]);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {title && (
        <div className="mb-2 text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <CodeEditorWrapper className="flex-1">
        <Editor
          value={value}
          language={languages[language] || 'javascript'}
          theme={currentTheme}
          loading={<div className="p-4">Loading editor...</div>}
          onChange={handleChange}
          onMount={handleMounted}
          options={{
            readOnly: readonly,
            quickSuggestions: false,
            minimap: { enabled: false },
            lineNumbersMinChars: 1,
            wordWrap: 'on',
            unicodeHighlight: {
              ambiguousCharacters: false,
            },
          }}
        />
      </CodeEditorWrapper>
    </div>
  );
}
