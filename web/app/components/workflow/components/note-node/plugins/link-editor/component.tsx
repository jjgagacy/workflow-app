import { useTranslation } from "react-i18next";
import { useNoteEditorStore } from "../../editor/store";
import { useEffect, useRef, useState } from "react";
import {
  FloatingPortal,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { useClickAway } from "ahooks";
import { Input } from "@/app/ui/input";
import Button from "@/app/components/base/button";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useLinkPlugin } from "./hooks";

export const LinkEditorComponent = ({ containerElement }: { containerElement?: HTMLElement | null }) => {
  const { t } = useTranslation();
  const linkAnchorElement = useNoteEditorStore(s => s.linkAnchorElement);
  const linkOperatorShow = useNoteEditorStore(s => s.linkOperatorShow);
  const setLinkOperatorShow = useNoteEditorStore(s => s.setLinkOperatorShow);
  const setLinkAnchorElement = useNoteEditorStore(s => s.setLinkAnchorElement);
  const selectionLinkUrl = useNoteEditorStore(s => s.selectionLinkUrl);
  const setSelectionLinkUrl = useNoteEditorStore(s => s.setSelectionLinkUrl);
  const [linkUrl, setLinkUrl] = useState(selectionLinkUrl);
  const floatingRef = useRef<HTMLDivElement>(null);
  const { saveLink } = useLinkPlugin();

  const { refs, floatingStyles, elements } = useFloating({
    placement: 'bottom',
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
    ],
  });

  useEffect(() => {
    setLinkUrl(selectionLinkUrl)
  }, [selectionLinkUrl]);

  useEffect(() => {
    if (linkAnchorElement)
      refs.setReference(linkAnchorElement);
  }, [linkAnchorElement, refs]);

  const setFloatingRef = (node: HTMLDivElement) => {
    floatingRef.current = node;
    refs.setFloating(node);
  };

  useClickOutside(floatingRef, () => {
    setLinkOperatorShow(false);
    setLinkAnchorElement(false);
  }, []);

  if (!linkAnchorElement)
    return null;

  return (
    <>
      {elements.reference && (
        <FloatingPortal root={containerElement}>
          <div
            ref={setFloatingRef}
            style={floatingStyles}
            className="bg-background rounded-md border border-[var(--border)] p-2 shadow nodrag nopan"
          >
            {
              linkOperatorShow ? (
                <div className="flex flex-col gap-2">
                  <button
                    className="px-2 py-1 text-sm hover:bg-gray-100 rounded"
                    onClick={() => {
                      setLinkOperatorShow(false);
                      setLinkAnchorElement(false);
                    }}
                  >
                    {t('workflow.note.linkEditor.confirm')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-row gap-2">
                  <Input
                    className="w-full text-sm h-6"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder=""
                    autoFocus
                  />
                  <Button
                    className="px-2 py-1 text-sm"
                    variant={'ghost'}
                    size={'small'}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveLink(linkUrl);
                    }}
                  >
                    {t('app.actions.confirm')}
                  </Button>
                </div>
              )
            }
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

