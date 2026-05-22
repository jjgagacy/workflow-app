import { useTranslation } from "react-i18next";
import { useNoteEditorStore } from "../../editor/store";
import { useEffect, useRef, useState } from "react";
import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { Input } from "@/app/ui/input";
import Button from "@/app/components/base/button";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useLinkPlugin, useOpenLink } from "./hooks";
import { escape } from "@/utils/escape";
import { Divider } from "@/app/components/base/divider";

export const LinkEditorComponent = ({ containerElement }: { containerElement?: HTMLElement | null }) => {
  const { t } = useTranslation();
  const linkAnchorElement = useNoteEditorStore(s => s.linkAnchorElement);
  const linkOperatorShow = useNoteEditorStore(s => s.linkOperatorShow);
  const setLinkEditing = useNoteEditorStore(s => s.setLinkEditing);
  const setLinkOperatorShow = useNoteEditorStore(s => s.setLinkOperatorShow);
  const setLinkAnchorElement = useNoteEditorStore(s => s.setLinkAnchorElement);
  const selectionLinkUrl = useNoteEditorStore(s => s.selectionLinkUrl);
  const [linkUrl, setLinkUrl] = useState(selectionLinkUrl);
  const floatingRef = useRef<HTMLDivElement>(null);
  const { saveLink, unLink } = useLinkPlugin();

  const { refs, floatingStyles, elements } = useFloating({
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
    ],
  });

  useEffect(() => {
    setLinkUrl(selectionLinkUrl)
  }, [linkAnchorElement, selectionLinkUrl]);

  useEffect(() => {
    if (linkAnchorElement) {
      refs.setReference(linkAnchorElement);
      return;
    }

    refs.setReference(null);
  }, [linkAnchorElement, refs]);

  const setFloatingRef = (node: HTMLDivElement) => {
    floatingRef.current = node;
    refs.setFloating(node);
  };

  const closeLinkEditor = () => {
    setLinkEditing(false);

    if (!selectionLinkUrl.trim()) {
      unLink();
      return;
    }

    setLinkOperatorShow(false);
    setLinkAnchorElement(null);
  };

  useClickOutside(floatingRef, () => {
    closeLinkEditor();
  }, []);

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
              !linkOperatorShow && (
                <div className="flex flex-row gap-2">
                  <Input
                    className="w-full text-sm h-6"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder=""
                  // autoFocus
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
            {
              linkOperatorShow && (
                <div className="flex flex-row gap-2">
                  <a
                    className="flex px-2 text-sm hover:bg-gray-100 rounded"
                    href={escape(linkUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div title={escape(linkUrl)} className="max-w-[140px] truncate text-green">
                      {escape(linkUrl)}
                    </div>
                  </a>
                  <Divider type="vertical" className="h-5.5 mx-1" />
                  <Button
                    variant={'ghost'}
                    size={'small'}
                    className="px-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLinkEditing(true);
                      setLinkOperatorShow(false);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={'ghost'}
                    size={'small'}
                    className="px-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      unLink();
                    }}
                  >
                    Unlink
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

