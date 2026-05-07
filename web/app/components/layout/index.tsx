export function LayoutWrapper({ children, sidebarWidth }: { children: React.ReactNode, sidebarWidth: string | number }) {
  return (
    <div className={`flex-1 flex flex-col overflow-x-auto transition-all ${sidebarWidth}`}>
      {children}
    </div>
  );
}
