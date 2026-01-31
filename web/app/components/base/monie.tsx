interface MonieProps {
  className?: string;
}

export const Monie = function ({ className, ...props }: MonieProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img
    src={'/assets/monie.svg'}
    className={`monie-logo ${className}`}
    {...props}
  />
};
