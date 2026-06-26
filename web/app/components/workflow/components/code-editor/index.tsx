'use client';
import { ASSETS_URL } from '@/config';
import Editor, { loader } from '@monaco-editor/react'
import { CodeLanguage } from '../../types';
import { codeLanguageDefault, codeLanguages } from './types';
import { cn } from '@/utils/classnames';
import { CodeEditorWrapper } from './components/wrapper';
import React, { useEffect, useMemo, useRef } from 'react';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { useTheme } from 'next-themes';
import { CUSTOM_THEMES } from './data';

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
  const themesRegistered = useRef(false);

  const monacoRef = useRef<MonacoType | null>(null);
  const editorRef = React.useRef<EditorType | null>(null);

  const handleChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value || '');
    }
  };

  const registerCustomThemes = (monaco: MonacoType) => {
    if (themesRegistered.current) return;
    // 注册亮色主题
    monaco.editor.defineTheme('custom-light', CUSTOM_THEMES.light);
    // 注册暗色主题
    monaco.editor.defineTheme('custom-dark', CUSTOM_THEMES.dark);
    themesRegistered.current = true;
  };

  const getCurrentThemeName = () => {
    return resolvedTheme === 'dark' ? 'custom-dark' : 'custom-light';
  };

  // 监听主题变化，动态更新编辑器主题
  useEffect(() => {
    if (editorRef.current && monacoRef.current && mounted) {
      const themeName = getCurrentThemeName();
      monacoRef.current.editor.setTheme(themeName);
    }
  }, [resolvedTheme, mounted]);

  const handleMounted = (editor: EditorType, monaco: MonacoType) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    registerCustomThemes(monaco);

    editor.onDidFocusEditorText(() => {
      setFocus(true);
    });

    editor.onDidBlurEditorText(() => {
      setFocus(false);
    });

    const appliedTheme = getCurrentThemeName();
    monaco.editor.setTheme(appliedTheme);

    // 设置编辑器选项以增强语法高亮
    editor.updateOptions({
      // 启用语法高亮
      colorDecorators: true,
      // 启用括号高亮
      bracketPairColorization: { enabled: true },
      // 启用语义高亮（需要 TypeScript/JavaScript）
      'semanticHighlighting.enabled': true,
    });

    onMounted?.(editor, monaco);
    setMounted(true);
  }

  const currentTheme = useMemo(() => {
    return getCurrentThemeName();
  }, [resolvedTheme, theme]);

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      {title && (
        <div className="mb-2 text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <CodeEditorWrapper className="flex-1">
        <Editor
          value={value}
          language={(codeLanguages[language] || codeLanguageDefault).toLowerCase()}
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
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Courier New", monospace',
            lineHeight: 1.5,
            // 高亮设置
            renderWhitespace: 'selection',
            renderControlCharacters: true,
            renderLineHighlight: 'all',
            // 括号高亮
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            // 语义高亮
            'semanticHighlighting.enabled': true,
            // 链接检测
            links: true,
          }}
        />
      </CodeEditorWrapper>
    </div>
  );
}
