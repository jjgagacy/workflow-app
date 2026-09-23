type LoadingProps = {
  type?: 'area' | 'app';
}

const Loading = ({ type = 'area' }: LoadingProps) => {
  return (
    <div
      className={`flex w-full items-center justify-center ${type === 'app' ? 'h-full' : ''
        }`}
    >
      {/* 只有一个圆环 */}
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-500 border-r-emerald-700"></div>
    </div>
  );
};

export default Loading;
