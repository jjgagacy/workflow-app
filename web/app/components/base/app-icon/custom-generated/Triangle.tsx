interface TriangleProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const Triangle = ({ className, size = 24, ...props }: TriangleProps) => {
  const width = props.width ?? size;
  const height = props.height ?? size;
  const currentColor = props.fill ?? 'currentColor';

  return (
    <svg
      className={`monie-icon ${className || ''}`}
      {...props}
      viewBox="0 0 512 512"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path key={0} d="M214.433 56C232.908 23.9999 279.096 24.0001 297.571 56L477.704 368C496.18 400 473.085 440 436.135 440H75.8685C38.918 440 15.8241 400 34.2993 368L214.433 56ZM256.002 144L131.294 360H380.709L256.002 144Z" fill={currentColor} />
    </svg>
  );
};

export default Triangle;