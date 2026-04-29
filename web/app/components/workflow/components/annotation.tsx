import { useViewport } from "@xyflow/react";

export const ViewportWithAnnotation = () => {
  const viewport = useViewport();

  return (
    <>
      <div
        className="bg-card border-[var(--border)] text-text-secondary"
        style={{
          fontFamily: 'monospace',
          padding: '5px',
          borderRadius: '3px',
        }}
      >
        <div style={{ fontFamily: 'monospace' }}>
          <div>x: {viewport.x.toFixed(2)}</div>
          <div>y: {viewport.y.toFixed(2)}</div>
          <div>zoom: {viewport.zoom.toFixed(2)}</div>
        </div>
      </div>
    </>
  );
}