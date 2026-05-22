import { useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode, LinkNode } from "@lexical/link";
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
import { getSelectedNode } from "../utils";

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

const getSelectedLinkNode = (selection: ReturnType<typeof $getSelection>) => {
  if (!$isRangeSelection(selection)) {
    return null;
  }

  const node = getSelectedNode(selection);
  const parent = node.getParent();

  if ($isLinkNode(node)) {
    return node;
  }

  if ($isLinkNode(parent)) {
    return parent;
  }

  return null;
};

export const useFormatChange = () => {
  const [editor] = useLexicalComposerContext();
  const noteEditorStore = useNoteEditorContext();

  if (!noteEditorStore)
    return;

  const syncSelectionFormat = () => {
    editor.getEditorState().read(() => {
      if (editor.isComposing())
        return;

      const {
        setSelectionBold,
        setSelectionItalic,
        setSelectionUnderline,
        setSelectionStrikethrough,
        setSelectionLink,
        setSelectionBulletedList,
        setSelectionLinkUrl,
      } = noteEditorStore.getState();
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        setSelectionBold(false);
        setSelectionItalic(false);
        setSelectionUnderline(false);
        setSelectionStrikethrough(false);
        setSelectionLink(false);
        setSelectionBulletedList(false);
        setSelectionLinkUrl('');
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

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      let linkNode: LinkNode | null = null;

      if ($isLinkNode(node)) {
        linkNode = node;
      } else if ($isLinkNode(parent)) {
        linkNode = parent;
      }

      console.log('url', linkNode?.getURL() ?? '');

      setSelectionLinkUrl(linkNode?.getURL() ?? '');
    });
  };

  useEffect(() => {
    if (!noteEditorStore) {
      return;
    }

    return mergeRegister(
      editor.registerUpdateListener(() => {
        syncSelectionFormat();
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          syncSelectionFormat();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, noteEditorStore]);

  useEffect(() => {
    globalThis.document.addEventListener('selectionchange', syncSelectionFormat)
    return () => {
      globalThis.document.removeEventListener('selectionchange', syncSelectionFormat)
    }
  }, [syncSelectionFormat])

};