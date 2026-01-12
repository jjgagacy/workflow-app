export const PageContainer = ({ children, scrollable }: { children: React.ReactNode, scrollable?: boolean }) => {
  return (
    <div className={`flex flex-1 w-full mx-auto ${scrollable ? 'overflow-y-auto' : ''}`}>
      {children}
    </div>
  );
}