interface NodeTrashProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const NodeTrash = ({ className, size = 24, ...props }: NodeTrashProps) => {
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
      <path key={0} d="M21 6a1 1 0 1 1 0 2h-1v12.125c0 .817-.424 1.534-.941 2.019-.522.488-1.256.856-2.059.856H7c-.803 0-1.537-.368-2.059-.856C4.424 21.659 4 20.943 4 20.125V8H3a1 1 0 0 1 0-2zm-7-5a3 3 0 0 1 3 3H7a3 3 0 0 1 3-3z" fill={currentColor} />
    </svg>
  );
};

export default NodeTrash;