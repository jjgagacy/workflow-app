import { toast } from "@/app/ui/toast";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isValidUrl } from "../../utils";
import { escape } from "@/utils/escape";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useNoteEditorContext, useNoteEditorStore } from "../../editor/store";
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, mergeRegister } from "lexical";

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
      setLinkAnchorElement(false);
      return;
    }

    if (!isValidUrl(nextUrl)) {
      toast.error('invalid url');
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, escape(nextUrl));
    setLinkEditing(false);
    setLinkAnchorElement(false);
  }, [editor, setLinkAnchorElement, setLinkEditing, t]);

  const unLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkEditing(false);
    setLinkAnchorElement(false);
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
            setLinkAnchorElement(true);
            if (selectionLinkUrl && !linkEditing) {
              setLinkOperatorShow(true);
            } else {
              setLinkOperatorShow(false);
            }
          } else {
            setLinkEditing(false);
            setLinkAnchorElement(false);
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
              setLinkAnchorElement(true);

              if (selectionLinkUrl) {
                setLinkOperatorShow(true);
              } else {
                setLinkOperatorShow(false);
              }
            } else {
              setLinkEditing(false);
              setLinkAnchorElement(false);
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