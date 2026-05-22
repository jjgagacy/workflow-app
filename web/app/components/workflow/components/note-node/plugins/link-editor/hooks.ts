import { toast } from "@/app/ui/toast";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { isValidUrl } from "../../utils";
import { escape } from "@/utils/escape";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useNoteEditorContext, useNoteEditorStore } from "../../editor/store";

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
    setLinkAnchorElement();
  }, [editor, t]);

  const unLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setLinkAnchorElement();
  }, [editor, t]);

  return {
    saveLink,
    unLink,
  }
}