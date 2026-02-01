export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-muted-light">
      {children}
    </div>
  );
}