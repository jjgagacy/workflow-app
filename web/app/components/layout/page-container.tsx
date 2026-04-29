export const PageContainer = ({ children, scrollable }: { children: React.ReactNode, scrollable?: boolean }) => {
  return (
    <div className={`flex flex-1 w-full mx-auto text-component ${scrollable ? 'overflow-y-auto' : ''}`}>
      {children}
    </div>
  );
}

export const ContentContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 sm:px-2 lg:px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}