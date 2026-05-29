import { useCallback, useEffect, useRef } from "react";

type UsePanelResizeOptions = {
  enabled: boolean;
  panelWidth: number;
  setPanelWidth: (width: number) => void;
};

export const usePanelResize = ({
  enabled,
  panelWidth,
  setPanelWidth,
}: UsePanelResizeOptions) => {
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(panelWidth);
  const isResizingRef = useRef(false);

  const handleResizeStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    resizeStartXRef.current = event.clientX;
    resizeStartWidthRef.current = panelWidth;
    isResizingRef.current = true;
  }, [enabled, panelWidth]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizingRef.current) {
        return;
      }

      setPanelWidth(resizeStartWidthRef.current + resizeStartXRef.current - event.clientX);
    };

    const handlePointerUp = () => {
      if (!isResizingRef.current) {
        return;
      }

      isResizingRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [setPanelWidth]);

  return {
    handleResizeStart,
  };
};