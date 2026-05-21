import { useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $getSelection, $createParagraphNode, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { useNoteEditorContext } from "../editor/store";

export type NoteCommandType =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "link"
  | "bulleted-list";

export const useCommand = () => {
  const [editor] = useLexicalComposerContext();
  const noteEditorStore = useNoteEditorContext();

  const handleCommand = useCallback((type: NoteCommandType) => {
    if (!noteEditorStore) {
      return;
    }

    if (type === "bold") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
      return;
    }

    if (type === "italic") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
      return;
    }

    if (type === "underline") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
      return;
    }

    if (type === "strikethrough") {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
      return;
    }

    if (type === "link") {
      const { selectionLink } = noteEditorStore.getState();
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, selectionLink ? null : "");
      return;
    }

    if (type === "bulleted-list") {
      const { selectionBulletedList } = noteEditorStore.getState();

      if (selectionBulletedList) {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
        return;
      }

      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, noteEditorStore]);

  return {
    handleCommand,
  };
}