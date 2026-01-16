export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/10">
      {children}
    </div>
  );
}