interface StatusErrorProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const StatusError = ({ className, size = 24, ...props }: StatusErrorProps) => {
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
      <path key={0} d="M 4.207 2.793 L 7 5.586 L 9.793 2.793 L 11.207 4.207 L 8.414 7 L 11.207 9.793 L 9.793 11.207 L 7 8.414 L 4.207 11.207 L 2.793 9.793 L 5.586 7 L 2.793 4.207 L 4.207 2.793 Z M 7 0 C 3.134 0 0 3.134 0 7 C 0 10.866 3.134 14 7 14 C 10.866 14 14 10.866 14 7 C 14 3.134 10.866 0 7 0 Z" fill={currentColor} />
    </svg>
  );
};

export default StatusError;