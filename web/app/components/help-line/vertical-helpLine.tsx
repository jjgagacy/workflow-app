import { useViewport } from "@xyflow/react";
import { VerticalSnapGuideLine } from "../workflow/store/types/help-line.type";

export const VerticalHelpLine = ({ top, left, height }: VerticalSnapGuideLine) => {
  const { x, y, zoom } = useViewport();

  return (
    <div
      className="absolute z-[20] w-[1px] bg-primary"
      style={{
        top: top * zoom + y,
        left: left * zoom + x,
        height: height * zoom,
        borderLeft: '1px dashed var(--color-primary)',
        background: 'transparent',
      }}
    />
  );
};
