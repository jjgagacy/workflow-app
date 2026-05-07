export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex theme-xx min-h-screen bg-muted/50">
      {children}
    </div>
  );
}