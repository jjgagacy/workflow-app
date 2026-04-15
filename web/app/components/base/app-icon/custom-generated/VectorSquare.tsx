interface VectorSquareProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const VectorSquare = ({ className, size = 24, ...props }: VectorSquareProps) => {
  const width = props.width ?? size;
  const height = props.height ?? size;
  const currentColor = props.fill ?? 'currentColor';

  return (
    <svg
      className={`monie-icon ${className || ''}`}
      {...props}
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" style={{ stroke: currentColor, strokeOpacity: 1 }} />
      <rect x="17" y="2" width="5" height="5" rx="1" stroke="currentColor" style={{ stroke: currentColor, strokeOpacity: 1 }} />
      <rect x="17" y="17" width="5" height="5" rx="1" stroke="currentColor" style={{ stroke: currentColor, strokeOpacity: 1 }} />
      <rect x="2" y="17" width="5" height="5" rx="1" stroke="currentColor" style={{ stroke: currentColor, strokeOpacity: 1 }} />
      <rect x="7" y="3" width="10" height="2" fill={currentColor} style={{ fill: currentColor, fillOpacity: 1 }} />
      <rect x="7" y="19" width="10" height="2" fill={currentColor} style={{ fill: currentColor, fillOpacity: 1 }} />
      <rect x="3" y="7" width="2" height="10" fill={currentColor} style={{ fill: currentColor, fillOpacity: 1 }} />
      <rect x="19" y="7" width="2" height="10" fill={currentColor} style={{ fill: currentColor, fillOpacity: 1 }} />
    </svg>
  );
};

export default VectorSquare;