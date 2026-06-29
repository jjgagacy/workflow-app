import React from "react";
import { useEffect } from "react";

type Props = {
  ref: React.RefObject<HTMLDivElement | null>;
}

export const useToggleExpanded = ({ ref }: Props) => {
  const [expanded, setExpanded] = React.useState(false);
  const [expandedHeight, setExpandedHeight] = React.useState(ref?.current?.clientHeight || 0);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (!expanded || !ref?.current) {
      return;
    }

    const updateHeight = () => {
      if (ref.current) {
        setExpandedHeight(ref.current.clientHeight);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [expanded, ref]);

  return {
    toggleExpand,
    expanded,
    expandedHeight,
  }
}
