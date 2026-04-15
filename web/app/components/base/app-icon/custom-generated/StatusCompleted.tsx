interface StatusCompletedProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const StatusCompleted = ({ className, size = 24, ...props }: StatusCompletedProps) => {
  const width = props.width ?? size;
  const height = props.height ?? size;
  const currentColor = props.fill ?? 'currentColor';

  return (
    <svg
      className={`monie-icon ${className || ''}`}
      {...props}
      viewBox="0 0 14 14"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path key={0} d="M 14 7 C 14 10.866 10.866 14 7 14 C 3.134 14 0 10.866 0 7 C 0 3.134 3.134 0 7 0 C 10.866 0 14 3.134 14 7 Z M 2.575 7.728 L 5.782 10.935 L 11.489 5.228 L 10.075 3.814 L 5.782 8.107 L 3.989 6.314 L 2.575 7.728 Z" fill={currentColor} />
    </svg>
  );
};

export default StatusCompleted;