import { toast } from "@/app/ui/toast";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isValidUrl } from "../../utils";
import { escape } from "@/utils/escape";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useNoteEditorContext, useNoteEditorStore } from "../../editor/store";
import { mergeRegister } from "lexical";

export const useLinkPlugin = () => {
  const { t } = useTranslation();
  const [editor] = useLexicalComposerContext()
  const setLinkAnchorElement = useNoteEditorStore(s => s.setLinkAnchorElement);

  const saveLink = useCallback((url: string) => {
    if (url && !isValidUrl(url)) {
      toast.error('invalid url');
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, escape(url));
    setLinkAnchorElement(false);
  }, [editor, t]);

  const unLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkAnchorElement(false);
  }, [editor, t]);

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
            setLinkAnchorElement,
            setLinkOperatorShow,
          } = noteEditorStore.getState();

          console.log('url', selectionLinkUrl, selectionLink);
          if (selectionLink) {
            setLinkAnchorElement(true);
            if (selectionLinkUrl) {
              console.log('open link', { selectionLinkUrl })
              setLinkOperatorShow(true);
            } else {
              console.log('no url set operator to false')
              setLinkOperatorShow(false);
            }
          } else {
            console.log('no link selected set operator to false')
            setLinkAnchorElement(false);
            setLinkOperatorShow(false);
          }
        });
      }),
      // editor.registerCommand(
      //   CLICK_COMMAND,
      //   (payload) => {
      //     setTimeout(() => {
      //       const {
      //         selectionLinkUrl,
      //         selectionLink,
      //         setLinkAnchorElement,
      //         setLinkOperatorShow,
      //       } = noteEditorStore.getState();

      //       if (selectionLink) {
      //         if ((payload.metaKey || payload.ctrlKey) && selectionLinkUrl) {
      //           window.open(selectionLinkUrl, '_blank');
      //           return true;
      //         }
      //         setLinkAnchorElement(true);

      //         if (selectionLinkUrl) {
      //           setLinkOperatorShow(true);
      //         } else {
      //           setLinkOperatorShow(false);
      //         }
      //       } else {
      //         setLinkAnchorElement(false);
      //         setLinkOperatorShow(false);
      //       }
      //     });
      //     return true;
      //   },
      //   COMMAND_PRIORITY_LOW,
      // ),
    );
  }, [editor, noteEditorStore]);
}