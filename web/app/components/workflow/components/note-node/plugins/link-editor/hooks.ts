import { toast } from "@/app/ui/toast";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isValidUrl } from "../../utils";
import { escape } from "@/utils/escape";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useNoteEditorContext, useNoteEditorStore } from "../../editor/store";
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, mergeRegister } from "lexical";

const getAnchorElementFromTarget = (target: EventTarget | null) => {
  if (!(target instanceof Node)) {
    return null;
  }

  const element = target instanceof HTMLElement ? target : target.parentElement;

  return element?.closest('a') ?? null;
};

const getAnchorElementFromSelection = () => {
  const selection = window.getSelection();
  const node = selection?.focusNode;

  if (!node) {
    return null;
  }

  const element = node instanceof HTMLElement ? node : node.parentElement;

  return element?.closest('a') ?? null;
};

export const useLinkPlugin = () => {
  const { t } = useTranslation();
  const [editor] = useLexicalComposerContext()
  const setLinkAnchorElement = useNoteEditorStore(s => s.setLinkAnchorElement);
  const setLinkEditing = useNoteEditorStore(s => s.setLinkEditing);

  const saveLink = useCallback((url: string) => {
    const nextUrl = url.trim();

    if (!nextUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setLinkEditing(false);
      setLinkAnchorElement(null);
      return;
    }

    if (!isValidUrl(nextUrl)) {
      toast.error('invalid url');
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, escape(nextUrl));
    setLinkEditing(false);
    setLinkAnchorElement(null);
  }, [editor, setLinkAnchorElement, setLinkEditing, t]);

  const unLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkEditing(false);
    setLinkAnchorElement(null);
  }, [editor, setLinkAnchorElement, setLinkEditing, t]);

  return {
    saveLink,
    unLink,
  }
}

export const useOpenLink = () => {
  const [editor] = useLexicalComposerContext()
  const noteEditorStore = useNoteEditorContext();
  if (!noteEditorStore) {
    return;
  }

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        setTimeout(() => {
          const {
            selectionLinkUrl,
            selectionLink,
            linkEditing,
            setLinkAnchorElement,
            setLinkOperatorShow,
            setLinkEditing,
          } = noteEditorStore.getState();

          if (selectionLink) {
            setLinkAnchorElement(getAnchorElementFromSelection());
            if (selectionLinkUrl && !linkEditing) {
              setLinkOperatorShow(true);
            } else {
              setLinkOperatorShow(false);
            }
          } else {
            setLinkEditing(false);
            setLinkAnchorElement(null);
            setLinkOperatorShow(false);
          }
        });
      }),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          setTimeout(() => {
            const {
              selectionLinkUrl,
              selectionLink,
              linkEditing,
              setLinkAnchorElement,
              setLinkOperatorShow,
              setLinkEditing,
            } = noteEditorStore.getState();

            if (selectionLink) {
              if ((payload.metaKey || payload.ctrlKey) && selectionLinkUrl) {
                window.open(selectionLinkUrl, '_blank');
                return true;
              }
              if (linkEditing) {
                return false;
              }
              const anchorElement = getAnchorElementFromTarget(payload.target);
              setLinkAnchorElement(anchorElement ?? getAnchorElementFromSelection());

              if (selectionLinkUrl) {
                setLinkOperatorShow(true);
              } else {
                setLinkOperatorShow(false);
              }
            } else {
              setLinkEditing(false);
              setLinkAnchorElement(null);
              setLinkOperatorShow(false);
            }
          });
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, noteEditorStore]);
}