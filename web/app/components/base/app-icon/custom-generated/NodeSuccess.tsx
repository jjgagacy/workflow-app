interface NodeSuccessProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const NodeSuccess = ({ className, size = 24, ...props }: NodeSuccessProps) => {
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
      <path key={0} d="M19.94 5.502a1.5 1.5 0 1 1 2.12 2.12L9.687 19.999a1.5 1.5 0 0 1-2.122 0L1.94 14.373a1.5 1.5 0 0 1 2.007-2.225l.115.104 4.564 4.564z" fill={currentColor} />
    </svg>
  );
};

export default NodeSuccess;