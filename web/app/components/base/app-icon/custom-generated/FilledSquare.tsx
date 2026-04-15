interface FilledSquareProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const FilledSquare = ({ className, size = 24, ...props }: FilledSquareProps) => {
  const width = props.width ?? size;
  const height = props.height ?? size;
  const currentColor = props.fill ?? 'currentColor';

  return (
    <svg
      className={`monie-icon ${className || ''}`}
      {...props}
      viewBox="0 0 10 10"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="10" height="10" rx="2" ry="2" fill={currentColor} />
    </svg>
  );
};

export default FilledSquare;