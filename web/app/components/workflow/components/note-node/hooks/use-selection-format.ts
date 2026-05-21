import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode } from "@lexical/link";
import { $isListNode } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  LexicalNode,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useNoteEditorContext } from "../editor/store";

const matchesSelectionAncestor = (
  nodes: LexicalNode[],
  matcher: (node: LexicalNode) => boolean,
) => {
  return nodes.some((node) => {
    let current: LexicalNode | null = node;

    while (current) {
      if (matcher(current)) {
        return true;
      }
      current = current.getParent();
    }

    return false;
  });
};

export const useSelectionFormat = () => {
  const [editor] = useLexicalComposerContext();
  const noteEditorStore = useNoteEditorContext();

  useEffect(() => {
    if (!noteEditorStore) {
      return;
    }

    const syncSelectionFormat = () => {
      const {
        setSelectionBold,
        setSelectionItalic,
        setSelectionUnderline,
        setSelectionStrikethrough,
        setSelectionLink,
        setSelectionBulletedList,
      } = noteEditorStore.getState();
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        setSelectionBold(false);
        setSelectionItalic(false);
        setSelectionUnderline(false);
        setSelectionStrikethrough(false);
        setSelectionLink(false);
        setSelectionBulletedList(false);
        return;
      }

      const nodes = selection.getNodes();
      const hasLink = matchesSelectionAncestor(nodes, (node) => $isLinkNode(node));
      const hasBulletedList = matchesSelectionAncestor(
        nodes,
        (node) => $isListNode(node) && node.getListType() === "bullet",
      );

      setSelectionBold(selection.hasFormat("bold"));
      setSelectionItalic(selection.hasFormat("italic"));
      setSelectionUnderline(selection.hasFormat("underline"));
      setSelectionStrikethrough(selection.hasFormat("strikethrough"));
      setSelectionLink(hasLink);
      setSelectionBulletedList(hasBulletedList);
    };

    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.getEditorState().read(syncSelectionFormat);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(syncSelectionFormat);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, noteEditorStore]);
};