import { useViewport } from "@xyflow/react";
import { HorizontalSnapGuideLine } from "../workflow/store/types/help-line.type";

export const HorizontalHelpLine = ({ top, left, width }: HorizontalSnapGuideLine) => {
  const { x, y, zoom } = useViewport()

  return (
    <div
      className="absolute z-[20] h-[1px] bg-primary"
      style={{
        top: top * zoom + y,
        left: left * zoom + x,
        width: width * zoom,
        borderTop: '1px dashed var(--color-green)',
        background: 'transparent',
      }}
    />
  );
}