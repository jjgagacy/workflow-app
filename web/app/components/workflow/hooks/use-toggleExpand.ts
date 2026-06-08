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
    if (ref?.current) {
      setExpandedHeight(ref.current.clientHeight);
    }
  }, [expanded]);

  return {
    toggleExpand,
    expanded,
    expandedHeight,
  }
}
