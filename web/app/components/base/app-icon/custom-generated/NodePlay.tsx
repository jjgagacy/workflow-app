interface NodePlayProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const NodePlay = ({ className, size = 24, ...props }: NodePlayProps) => {
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
      <path key={0} d="M5.52 2.122c.322-.175.713-.16 1.021.037l14 9a1 1 0 0 1 0 1.682l-14 9A1.001 1.001 0 0 1 5 21V3a1 1 0 0 1 .52-.878" fill={currentColor} />
    </svg>
  );
};

export default NodePlay;