export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-white dark:bg-neutral-800">
      {children}
    </div>
  );
}