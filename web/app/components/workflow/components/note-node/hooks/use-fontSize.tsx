import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_CRITICAL, SELECTION_CHANGE_COMMAND } from "lexical";
import { $patchStyleText, $getSelectionStyleValueForProperty } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";

export const FONT_SIZE_OPTIONS = [
  { label: 'XS', value: '10px' },
  { label: 'S', value: '12px' },
  { label: 'M', value: '14px' },
  { label: 'L', value: '18px' },
  { label: 'XL', value: '24px' },
];

export const useFontSize = () => {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState('12px');

  const handleFontSize = useCallback((size: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection))
        $patchStyleText(selection, { 'font-size': size });
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const size = $getSelectionStyleValueForProperty(selection, 'font-size', '12px');
            setFontSize(size);
          }
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const size = $getSelectionStyleValueForProperty(selection, 'font-size', '12px');
            setFontSize(size);
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  return {
    fontSize,
    fontSizeOptions: FONT_SIZE_OPTIONS,
    handleFontSize,
  };
};